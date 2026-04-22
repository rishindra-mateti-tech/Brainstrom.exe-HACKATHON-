import json

with open('model_training.ipynb', 'r', encoding='utf-8') as f:
    nb = json.load(f)

for cell in nb['cells']:
    if cell['cell_type'] == 'code':
        new_source = []
        for line in cell['source']:
            # Remove leftover HistGB references
            if 'r_hgb_all' in line or 'r_hgb_skin' in line:
                continue
            if "HistGB" in line and "best_all_name" in line:
                continue
            if "HistGB" in line and "best_all_acc" in line:
                continue
            if "HistGB" in line and "best_all_metrics" in line:
                continue
            new_source.append(line)
        cell['source'] = new_source

with open('model_training.ipynb', 'w', encoding='utf-8') as f:
    json.dump(nb, f, indent=1)

print("Cleaned up leftover HistGB references")
