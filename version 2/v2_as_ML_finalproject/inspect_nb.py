import json

with open('model_training.ipynb', 'r', encoding='utf-8') as f:
    nb = json.load(f)

for i, cell in enumerate(nb['cells']):
    cell_type = cell['cell_type']
    source = cell.get('source', [''])[0].strip() if cell.get('source') else ''
    print(f"Cell {i} ({cell_type}): {source[:50]}")
