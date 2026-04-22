from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
import joblib
import pandas as pd
import numpy as np
import os
from scipy.sparse import hstack
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="CUTIeS-IQ ML Inference API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables for models
model = None
mlb = None
tfidf_name = None
tfidf_desc = None
annex_ii_data = None
annex_iii_data = None

MODEL_DIR = os.path.join(os.path.dirname(__file__), "models")
DATA_DIR = r"C:\Users\rishi\OneDrive\Desktop\dataset ( cuties V2)"

class IngredientRequest(BaseModel):
    inci_name: str
    description: str = ""

class AnalysisResult(BaseModel):
    inci_name: str
    predicted_functions: List[str]
    confidence_score: float # 0 to 1
    is_restricted: bool
    restriction_details: str | None = None
    is_prohibited: bool
    prohibited_details: str | None = None
    safety_score: int

@app.on_event("startup")
async def load_models():
    global model, mlb, tfidf_name, tfidf_desc, annex_ii_data, annex_iii_data
    
    print("Loading models and vectorizers...")
    try:
        model = joblib.load(os.path.join(MODEL_DIR, "ingredient_function_classifier.pkl"))
        mlb = joblib.load(os.path.join(MODEL_DIR, "mlb_functions.pkl"))
        tfidf_name = joblib.load(os.path.join(MODEL_DIR, "tfidf_name.pkl"))
        tfidf_desc = joblib.load(os.path.join(MODEL_DIR, "tfidf_desc.pkl"))
        print("Models loaded successfully.")
    except Exception as e:
        print(f"Failed to load models. Did you run train.py first? Error: {e}")
        
    print("Loading regulatory data for safety checks...")
    try:
        # Load Annex II (Prohibited) and Annex III (Restricted)
        annex_ii = pd.read_excel(os.path.join(DATA_DIR, "COSING_Annex_II_v2.xls"))
        annex_iii = pd.read_excel(os.path.join(DATA_DIR, "COSING_Annex_III_v2.xls"))
        
        # Clean up column names for easier access
        annex_ii.columns = annex_ii.columns.str.strip()
        annex_iii.columns = annex_iii.columns.str.strip()
        
        # Build dictionaries for fast lookup
        # We index by Chemical name/INCI name (usually Chemical name is more prominent in these docs)
        annex_ii_data = {}
        for _, row in annex_ii.iterrows():
            chem_name = str(row.get('Chemical name/INN', '')).strip().upper()
            if chem_name and chem_name != 'NAN':
                annex_ii_data[chem_name] = f"Ref: {row.get('Reference number', 'N/A')}"
                
        annex_iii_data = {}
        for _, row in annex_iii.iterrows():
            chem_name = str(row.get('Chemical name/INN', '')).strip().upper()
            if chem_name and chem_name != 'NAN':
                restrictions = f"Max: {row.get('Maximum concentration in ready for use preparation', 'N/A')}. Conditions: {row.get('Other', 'N/A')}"
                annex_iii_data[chem_name] = restrictions
                
        print(f"Loaded {len(annex_ii_data)} prohibited substances and {len(annex_iii_data)} restricted substances.")
    except Exception as e:
        print(f"Failed to load regulatory data. Error: {e}")

@app.post("/api/ml/analyze-ingredient", response_model=AnalysisResult)
async def analyze_ingredient(req: IngredientRequest):
    if model is None or mlb is None:
        raise HTTPException(status_code=503, detail="Models not loaded")
        
    inci_name = req.inci_name.strip().upper()
    description = req.description.strip()
    
    # 1. Feature Extraction
    X_name = tfidf_name.transform([inci_name])
    X_desc = tfidf_desc.transform([description])
    X_comb = hstack([X_name, X_desc])
    
    # 2. Prediction
    # Use predict_proba to get confidence scores
    # MultiOutputClassifier with RF returns a list of arrays (one for each label)
    probas = model.predict_proba(X_comb)
    
    predicted_funcs = []
    # Calculate average confidence for positively predicted functions
    confidence_sum = 0
    positive_count = 0
    
    # Base RF might predict no classes, we want to at least return probabilities if they are high
    for i, class_probas in enumerate(probas):
        # class_probas shape is (n_samples, n_classes). We have 1 sample.
        prob_positive = class_probas[0, 1] if class_probas.shape[1] > 1 else 0
        
        # Threshold for predicting a function
        if prob_positive > 0.4:  # Slightly lower threshold than default 0.5 to be more inclusive
            predicted_funcs.append(mlb.classes_[i])
            confidence_sum += prob_positive
            positive_count += 1
            
    # Default functions if nothing strongly predicted
    if len(predicted_funcs) == 0:
        predicted_funcs = ["UNKNOWN"]
        avg_confidence = 0.5 # Default middle confidence
    else:
        avg_confidence = confidence_sum / positive_count
        
    # 3. Regulatory / Safety Check
    is_prohibited = False
    prohibited_details = None
    is_restricted = False
    restriction_details = None
    
    # We do a basic substring/exact match against Annex data. 
    # In a production system, this would be a more robust fuzzy match.
    if annex_ii_data:
        for chem, details in annex_ii_data.items():
            if inci_name in chem or chem in inci_name:
                is_prohibited = True
                prohibited_details = details
                break
                
    if not is_prohibited and annex_iii_data:
        for chem, details in annex_iii_data.items():
            if inci_name in chem or chem in inci_name:
                is_restricted = True
                restriction_details = details
                break
                
    safety_score = 100
    if is_prohibited:
        safety_score = 0
    elif is_restricted:
        safety_score = 50

    return AnalysisResult(
        inci_name=inci_name,
        predicted_functions=predicted_funcs,
        confidence_score=float(avg_confidence),
        is_restricted=bool(is_restricted),
        restriction_details=restriction_details,
        is_prohibited=bool(is_prohibited),
        prohibited_details=prohibited_details,
        safety_score=safety_score
    )

@app.get("/health")
def health_check():
    return {"status": "ok", "models_loaded": model is not None}
