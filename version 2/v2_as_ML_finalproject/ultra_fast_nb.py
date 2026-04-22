import json

with open('model_training.ipynb', 'r', encoding='utf-8') as f:
    nb = json.load(f)

# Cells 4, 5, 6 are baselines and take forever. We will just empty their source.
for i in [4, 5, 6]:
    if i < len(nb['cells']):
        nb['cells'][i]['source'] = ["print('Skipping slow baseline models...')\n"]

with open('model_training.ipynb', 'w', encoding='utf-8') as f:
    json.dump(nb, f, indent=1)

print("Baseline cells emptied.")
