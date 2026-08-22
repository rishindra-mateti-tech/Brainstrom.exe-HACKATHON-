# CUTIeS-IQ ML Microservice

This service is a FastAPI-based backend that provides machine learning inference for cosmetic ingredient analysis. It is designed to work in tandem with the CUTIeS-IQ Next.js frontend, providing advanced multi-label classification of ingredients based on the CosIng dataset, plus a scraping + Gemini-backed fallback for ingredients the trained model doesn't recognize.

## Architecture

*   **API Framework**: FastAPI
*   **Machine Learning**: `scikit-learn`
*   **Model Approach**:
    *   MultiLabel Classification (`MultiOutputClassifier`) wrapped around a `RandomForestClassifier`.
    *   Features constructed using `TfidfVectorizer` on both ingredient INCI names (character n-grams) and their safety descriptions.
    *   Classification targets over 50+ unique cosmetic ingredient functions.
*   **Unknown-ingredient fallback**: `scraper.py` looks up supplementary facts on INCIDecoder; `gemini_fallback.py` sends those facts (or a "no verified source" caveat) to Gemini to produce a personalized, clearly-labeled assessment. See "Unknown ingredient fallback" below.

## Data paths

Both `main.py` (for the Annex II/III regulatory `.xls` files) and `train.py` (for the CosIng ingredient CSV) resolve the dataset directory relative to their own file location by default:

```
ml_service/../../v2_as_ML_finalproject/dataset_for_v2
```

i.e. the CosIng dataset checked into the repo as a sibling of `ml_service` (both live under `version 2/`). You don't need to configure anything for a normal checkout.

*   `main.py` can be overridden with the `COSING_DATA_DIR` environment variable. If the Annex `.xls` files fail to load (missing directory, bad path, etc.) this is logged and the safety-check fields (`is_prohibited`/`is_restricted`) simply no-op rather than crashing the service.
*   `train.py` accepts `--data-dir` and `--output-dir` CLI flags if you want to point it elsewhere. `--output-dir` defaults to `ml_service/models/`.

See `.env.example` for the full list of environment variables this service reads.

## Endpoints

### `POST /api/ml/analyze-ingredient`
Analyzes a single ingredient (INCI name) against the trained classifier and returns its predicted functions, confidence score, and safety constraints.

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
  "inci_name": "GLYCERIN",
  "predicted_functions": ["HUMECTANT", "SKIN CONDITIONING"],
  "confidence_score": 0.92,
  "is_restricted": false,
  "restriction_details": null,
  "is_prohibited": false,
  "prohibited_details": null,
  "safety_score": 100
}
```

### `POST /api/ml/analyze-unknown-ingredient`
Fallback path for an ingredient the trained classifier doesn't recognize. Scrapes INCIDecoder for supplementary facts (best-effort; may return nothing), then asks Gemini to synthesize a personalized assessment grounded in those facts -- or, if no facts were found, an explicitly-caveated AI estimate. Results are cached in-process per ingredient name for the life of the server process.

**Request body:**
```json
{
  "inci_name": "SOME UNRECOGNIZED INGREDIENT",
  "description": "",
  "user_context": {
    "skin_type": "combination",
    "goals": [{"goal_name": "reduce redness", "priority": 1}],
    "allergies": ["fragrance"],
    "history": [{"ingredient_name": "retinol", "reaction": "irritation"}]
  },
  "gemini_api_key": "..."
}
```

`gemini_api_key` is required on every request -- the Next.js layer is responsible for resolving which key to use (user's own BYOK key vs. a project default) before calling this endpoint. If it's missing/empty, this endpoint returns HTTP 400.

**Response:**
```json
{
  "inci_name": "SOME UNRECOGNIZED INGREDIENT",
  "effectiveness": 62,
  "reason": "...",
  "compatibility": {"oily": 70, "dry": 40, "combination": 60, "sensitive": 30, "normal": 65},
  "source": "verified",
  "source_url": "https://incidecoder.com/ingredients/..."
}
```

`source` is either `"verified"` (facts were found on INCIDecoder and used to ground the assessment) or `"ai_estimate"` (no verified source was found; Gemini's general knowledge was used and the `reason` field is required to say so explicitly). This field is set/validated server-side in `gemini_fallback.py`, not trusted blindly from the model's own output.

### `GET /health`
Returns `{"status": "ok", "models_loaded": <bool>}`.

## Unknown ingredient fallback: important disclosure

`scraper.py` scrapes https://incidecoder.com for ingredient facts. This is **not** covered by an API agreement and may violate that site's Terms of Service -- this is a known, accepted risk for this personal/educational project, on the condition that scraping is done responsibly (honest identifying User-Agent, rate-limited, short timeout, defensive parsing that fails closed) and that the risk is disclosed to end users in the app UI (disclosure UI is a frontend concern, not part of this module). See the docstring at the top of `scraper.py` for full detail, including a note that incidecoder.com currently 301-redirects to a different domain server-side -- flagged there for follow-up, not silently worked around.

## Structure

*   `main.py`: The FastAPI application and endpoint definitions.
*   `train.py`: Data cleaning, TF-IDF vectorization, model training loop, and artifact generation.
*   `scraper.py`: INCIDecoder scraper used as a fallback fact source for unrecognized ingredients.
*   `gemini_fallback.py`: Builds grounded/caveated prompts and calls the Gemini REST API to synthesize a personalized ingredient insight.
*   `test_api.py`: Simple synchronous Python script to send test requests to the locally hosted API.
*   `models/`: Directory containing exported `.pkl` files (classifier, vectorizers, MultiLabelBinarizer) plus `classes.txt`. These are produced by running `train.py` and are already present in this checkout from a completed training run.

## Developing

1. Create a virtual environment and install dependencies from `requirements.txt`:
   ```bash
   python -m venv venv
   venv/Scripts/activate   # or: source venv/bin/activate on macOS/Linux
   pip install -r requirements.txt
   ```
2. (Optional) Re-train the model. The dataset is already checked into the repo, so this works with no arguments:
   ```bash
   python train.py
   ```
   Pass `--data-dir` / `--output-dir` to point at a different dataset or output location.
3. Run the API locally:
   ```bash
   uvicorn main:app --reload --port 8000
   ```
4. Sanity check:
   ```bash
   curl http://localhost:8000/health
   ```
