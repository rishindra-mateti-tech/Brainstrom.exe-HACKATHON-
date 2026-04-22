# CUTIeS-IQ ML Microservice

This service is a FastAPI-based backend that provides machine learning inference for cosmetic ingredient analysis. It is designed to work in tandem with the CUTIeS-IQ Next.js frontend, providing advanced multi-label classification of ingredients based on the CosIng dataset.

## Architecture

*   **API Framework**: FastAPI
*   **Machine Learning**: `scikit-learn`
*   **Model Approach**: 
    *   MultiLabel Classification (`MultiOutputClassifier`) wrapped around a `RandomForestClassifier`.
    *   Features constructed using `TfidfVectorizer` on both ingredient INCI names (character n-grams) and their safety descriptions.
    *   Classification targets over 50+ unique cosmetic ingredient functions.

## Endpoints

### `POST /api/ml/analyze-ingredient`
Analyzes a single ingredient (INCI name) and returns its predicted functions, confidence score, and safety constraints.

**Request Body:**
```json
{
  "inci_name": "GLYCERIN",
  "description": "Humectant, conditioning agent"
}
```

**Response:**
```json
{
  "ingredient": "GLYCERIN",
  "predicted_functions": ["HUMECTANT", "SKIN CONDITIONING"],
  "confidence_score": 0.92,
  "is_prohibited": false,
  "is_restricted": false,
  "prohibited_details": null,
  "restriction_details": null,
  "product_type_flags": ["SKIN"]
}
```

## Structure

*   `main.py`: The FastAPI application and endpoint definitions.
*   `train.py`: Data cleaning, TF-IDF vectorization, model training loop, and artifact generation.
*   `test_api.py`: Simple synchronous Python script to send test requests to the locally hosted API.
*   `models/`: Directory containing exported `.pkl` files (classifier, vectorizers, MultiLabelBinarizer).

## Developing

1. Ensure dependencies from `requirements.txt` are installed.
2. If training from scratch, download the CosIng `COSING_Ingredients-Fragrance Inventory_v2.csv` and point `train.py` to its directory.
3. Run the API locally:
   ```bash
   uvicorn main:app --reload --port 8000
   ```
