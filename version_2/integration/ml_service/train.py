import argparse
import pandas as pd
import numpy as np
import joblib
import os
import re
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import MultiLabelBinarizer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
from sklearn.multioutput import MultiOutputClassifier
from sklearn.metrics import classification_report
from scipy.sparse import hstack

def load_and_clean_data(data_dir):
    print("Loading data...")
    df = pd.read_csv(os.path.join(data_dir, "COSING_Ingredients-Fragrance Inventory_v2.csv"))
    
    # 1. Clean INCI names
    df['INCI name'] = df['INCI name'].astype(str).str.strip().str.upper()
    df = df.dropna(subset=['INCI name'])
    df = df[df['INCI name'] != 'NAN']
    
    # 2. Extract Functions (Multi-label)
    df['Function'] = df['Function'].fillna('UNKNOWN')
    
    def process_functions(func_string):
        if not isinstance(func_string, str):
            return ['UNKNOWN']
        # Split by comma or semicolon
        funcs = re.split(r'[,;]', func_string)
        # Clean and uppercase
        cleaned_funcs = [f.strip().upper() for f in funcs if f.strip()]
        return cleaned_funcs if cleaned_funcs else ['UNKNOWN']
        
    df['Function_List'] = df['Function'].apply(process_functions)
    
    # 3. Handle Descriptions
    df['Description'] = df['Chem/IUPAC Name / Description'].fillna('')
    
    # 4. Filter to top N functions to avoid extreme class imbalance on rare functions
    all_funcs = [f for funcs in df['Function_List'] for f in funcs]
    func_counts = pd.Series(all_funcs).value_counts()
    
    # Keep functions that appear at least 20 times
    valid_functions = set(func_counts[func_counts >= 20].index)
    
    def filter_functions(funcs):
        filtered = [f for f in funcs if f in valid_functions]
        return filtered if filtered else ['UNKNOWN']
        
    df['Function_List'] = df['Function_List'].apply(filter_functions)
    
    return df

def train_model(df, output_dir):
    print("Preparing features...")
    
    # 1. MultiLabel Binarizer for target
    mlb = MultiLabelBinarizer()
    y = mlb.fit_transform(df['Function_List'])
    
    print(f"Number of function classes: {len(mlb.classes_)}")
    
    # 2. TF-IDF on names and descriptions
    tfidf_name = TfidfVectorizer(max_features=1000, analyzer='char_wb', ngram_range=(2, 5))
    X_name = tfidf_name.fit_transform(df['INCI name'])
    
    tfidf_desc = TfidfVectorizer(max_features=1000, stop_words='english')
    X_desc = tfidf_desc.fit_transform(df['Description'])
    
    # Combine features
    X = hstack([X_name, X_desc])
    
    # 3. Train/Test Split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print("Training model (this may take a few minutes)...")
    # Using RandomForest inside MultiOutputClassifier
    # NOTE: MultiOutputClassifier trains one full RandomForest per label class (69 classes
    # here), so tree size/count directly multiplies the artifact size. Unconstrained trees
    # (no max_depth) produced a ~660MB pickle -- too large for free-tier hosting memory
    # limits. Capping max_depth/min_samples_leaf and trimming n_estimators keeps accuracy
    # close to the unconstrained baseline while cutting the artifact down drastically.
    #
    # IMPORTANT: n_jobs=-1 on BOTH MultiOutputClassifier and RandomForestClassifier
    # multiplies parallelism (one process per label x one process per tree job each),
    # which blew past 8GB and OOM'd on a constrained CI/build machine. Parallelize at
    # only one level and cap it explicitly so peak memory stays bounded regardless of
    # how many cores the build host reports.
    base_rf = RandomForestClassifier(
        n_estimators=50,
        max_depth=20,
        min_samples_leaf=2,
        n_jobs=2,
        random_state=42,
        class_weight='balanced',
    )
    model = MultiOutputClassifier(base_rf, n_jobs=1)
    
    model.fit(X_train, y_train)
    
    print("Evaluating model...")
    y_pred = model.predict(X_test)
    
    # Generate report
    report = classification_report(y_test, y_pred, target_names=mlb.classes_, zero_division=0)
    print("Classification Report:")
    print(report)
    
    # Save artifacts
    os.makedirs(output_dir, exist_ok=True)
    print(f"Saving artifacts to {output_dir}...")
    
    joblib.dump(model, os.path.join(output_dir, 'ingredient_function_classifier.pkl'))
    joblib.dump(mlb, os.path.join(output_dir, 'mlb_functions.pkl'))
    joblib.dump(tfidf_name, os.path.join(output_dir, 'tfidf_name.pkl'))
    joblib.dump(tfidf_desc, os.path.join(output_dir, 'tfidf_desc.pkl'))
    
    # Save a sample of the classes for easy reference in the API
    with open(os.path.join(output_dir, 'classes.txt'), 'w') as f:
        for c in mlb.classes_:
            f.write(f"{c}\n")

    print("Training complete!")

def _default_data_dir():
    # ml_service/../../v2_as_ML_finalproject/dataset_for_v2 -- the CosIng dataset
    # checked into the repo alongside this service.
    return os.path.join(os.path.dirname(__file__), "..", "..", "v2_as_ML_finalproject", "dataset_for_v2")


def _default_output_dir():
    return os.path.join(os.path.dirname(__file__), "models")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train the CUTIeS-IQ ingredient-function classifier.")
    parser.add_argument(
        "--data-dir",
        default=_default_data_dir(),
        help="Directory containing the CosIng CSV dataset (default: repo-relative ../../v2_as_ML_finalproject/dataset_for_v2).",
    )
    parser.add_argument(
        "--output-dir",
        default=_default_output_dir(),
        help="Directory to write trained model artifacts to (default: ml_service/models).",
    )
    args = parser.parse_args()

    df = load_and_clean_data(args.data_dir)
    train_model(df, args.output_dir)
