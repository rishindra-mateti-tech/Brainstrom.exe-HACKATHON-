import json

with open('model_training.ipynb', 'r', encoding='utf-8') as f:
    nb = json.load(f)

for cell in nb['cells']:
    if cell['cell_type'] == 'code':
        cell['source'] = [s.replace('desc_col', "'Chem/IUPAC Name / Description'") for s in cell['source']]

with open('model_training.ipynb', 'w', encoding='utf-8') as f:
    json.dump(nb, f, indent=1)
