import json

with open('model_training.ipynb', 'r', encoding='utf-8') as f:
    nb = json.load(f)

for cell in nb['cells']:
    if cell['cell_type'] == 'code':
        new_source = []
        for line in cell['source']:
            if "TfidfVectorizer(max_features=1500" in line:
                line = line.replace("max_features=1500, analyzer='char_wb', ngram_range=(2, 5)", "max_features=8000, analyzer='char_wb', ngram_range=(2, 6)")
            if "TfidfVectorizer(max_features=500" in line:
                line = line.replace("max_features=500, stop_words='english'", "max_features=6000, analyzer='word', ngram_range=(1, 3)")
            new_source.append(line)
        cell['source'] = new_source

with open('model_training.ipynb', 'w', encoding='utf-8') as f:
    json.dump(nb, f, indent=1)
