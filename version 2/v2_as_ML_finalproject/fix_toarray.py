import json

with open('model_training.ipynb', 'r', encoding='utf-8') as f:
    nb = json.load(f)

for cell in nb['cells']:
    if cell['cell_type'] == 'code':
        cell['source'] = [line.replace('.toarray()', '') for line in cell['source']]

with open('model_training.ipynb', 'w', encoding='utf-8') as f:
    json.dump(nb, f, indent=1)

print("Removed all .toarray() calls - HistGB accepts sparse matrices in modern sklearn")
