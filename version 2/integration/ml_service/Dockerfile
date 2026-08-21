FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# NOTE: Trained model artifacts (models/ingredient_function_classifier.pkl,
# models/mlb_functions.pkl, models/tfidf_name.pkl, models/tfidf_desc.pkl) must already
# exist in ./models within this build context -- they are copied in by the `COPY . .`
# above along with the rest of the service. Run train.py (see README.md) before
# building this image if they aren't present yet; the service will start but
# /health will report models_loaded: false and /api/ml/analyze-ingredient will fail
# with 503 if they're missing.

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
