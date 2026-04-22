import json

with open('model_training.ipynb', 'r', encoding='utf-8') as f:
    nb = json.load(f)

for cell in nb['cells']:
    if cell['cell_type'] == 'code':
        new_source = []
        for line in cell['source']:
            line = line.replace("df_skin['Chem/IUPAC Name / Description']", "df_skin['Description']")
            line = line.replace("tf1.fit_transform", "tfidf_name.fit_transform")
            line = line.replace("tf2.fit_transform", "tfidf_desc.fit_transform")
            new_source.append(line)
        cell['source'] = new_source

with open('model_training.ipynb', 'w', encoding='utf-8') as f:
    json.dump(nb, f, indent=1)
