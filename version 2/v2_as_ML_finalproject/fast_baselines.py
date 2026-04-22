import json

with open('model_training.ipynb', 'r', encoding='utf-8') as f:
    nb = json.load(f)

for cell in nb['cells']:
    if cell['cell_type'] == 'code':
        new_source = []
        for line in cell['source']:
            if "'Logistic Regression'" in line or "'LinearSVC'" in line or "'LogisticRegression'" in line:
                continue
            if "LogisticRegression" in line and "=" in line:
                continue
            if "LinearSVC" in line and "=" in line:
                continue
            new_source.append(line)
        cell['source'] = new_source

with open('model_training.ipynb', 'w', encoding='utf-8') as f:
    json.dump(nb, f, indent=1)

print("Fast baselines applied.")
