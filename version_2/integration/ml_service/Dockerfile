FROM python:3.11-slim

WORKDIR /app

# This Dockerfile expects the BUILD CONTEXT to be "version_2/" (the parent of both
# integration/ml_service and v2_as_ML_finalproject), not ml_service/ itself --
# training needs the CosIng CSV, and the regulatory safety check needs the Annex
# .xls files, both of which live in the sibling v2_as_ML_finalproject/ folder.
# On Render: set "Docker Build Context Directory" to version_2, and
# "Dockerfile Path" to version_2/integration/ml_service/Dockerfile.

COPY integration/ml_service/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY integration/ml_service/ ./
COPY v2_as_ML_finalproject/dataset_for_v2/ ./dataset/

# Train fresh at build time. The trained classifier is ~100MB+, too large to commit
# to git (GitHub's 100MB hard limit) -- training during the image build avoids ever
# needing to check the binary artifact in, and keeps it reproducible from source.
RUN python train.py --data-dir ./dataset --output-dir ./models

# main.py's default COSING_DATA_DIR assumes ml_service and v2_as_ML_finalproject are
# siblings on disk (true locally, not true in this flattened image layout), so point
# it explicitly at where we copied the dataset above.
ENV COSING_DATA_DIR=/app/dataset

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
