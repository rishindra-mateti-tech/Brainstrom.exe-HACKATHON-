import nbformat
from nbconvert.preprocessors import ExecutePreprocessor
import os

notebook_path = 'model_training.ipynb'

print("Starting notebook execution...")
with open(notebook_path, 'r', encoding='utf-8') as f:
    nb = nbformat.read(f, as_version=4)

ep = ExecutePreprocessor(timeout=600, kernel_name='python3')

try:
    ep.preprocess(nb, {'metadata': {'path': './'}})
    print("Execution successful.")
except Exception as e:
    print(f"Error during execution: {e}")

with open(notebook_path, 'w', encoding='utf-8') as f:
    nbformat.write(nb, f)

print("Notebook saved with results.")
