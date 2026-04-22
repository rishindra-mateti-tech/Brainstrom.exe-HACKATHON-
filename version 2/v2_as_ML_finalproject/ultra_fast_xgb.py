import json

with open('model_training.ipynb', 'r', encoding='utf-8') as f:
    nb = json.load(f)

for cell in nb['cells']:
    if cell['cell_type'] == 'code':
        new_source = []
        for line in cell['source']:
            # Fast XGBoost params
            if "xgb_model = xgb.XGBClassifier(" in line:
                line = "xgb_model = xgb.XGBClassifier(use_label_encoder=False, eval_metric='mlogloss', random_state=42, n_jobs=4, tree_method='hist', n_estimators=10, max_depth=3, colsample_bytree=0.2)\n"
            elif "xgb_model_skin = xgb.XGBClassifier(" in line:
                line = "xgb_model_skin = xgb.XGBClassifier(use_label_encoder=False, eval_metric='mlogloss', random_state=42, n_jobs=4, tree_method='hist', n_estimators=50, colsample_bytree=0.2)\n"
            new_source.append(line)
        cell['source'] = new_source

with open('model_training.ipynb', 'w', encoding='utf-8') as f:
    json.dump(nb, f, indent=1)
