import json

with open('model_training.ipynb', 'r', encoding='utf-8') as f:
    nb = json.load(f)

# Replace HistGradientBoosting with RF-500 (handles sparse, fast)
for cell in nb['cells']:
    if cell['cell_type'] == 'code':
        new_source = []
        skip = False
        for line in cell['source']:
            # Replace HistGB on all data
            if 'HistGradientBoosting' in line and 'import' in line:
                line = line.replace(', HistGradientBoostingClassifier', '')
            
            # Skip HistGB training blocks on all data
            if "Training HistGradientBoosting on all data" in line:
                skip = True
            if skip and "pick best" in line:
                skip = False
                # Replace best-picking logic
                new_source.append("# RF-300 is our best model for all data\n")
                new_source.append("best_all_name = 'RF-300'\n")
                new_source.append("best_all_acc = r_rf_all['Accuracy']\n")
                new_source.append("best_all_metrics = r_rf_all\n")
                continue
            
            # Skip HistGB training blocks on skincare
            if "Training HistGradientBoosting on skincare" in line:
                skip = True
            if skip and "pick best skincare" in line:
                skip = False
                # Replace with RF-500 on skincare
                new_source.append("# also try RF with 500 trees for skincare\n")
                new_source.append("print(\"Training RF (500 trees) on skincare data...\")\n")
                new_source.append("rf_skin_500 = RandomForestClassifier(\n")
                new_source.append("    n_estimators=500, class_weight='balanced_subsample',\n")
                new_source.append("    random_state=42, n_jobs=-1)\n")
                new_source.append("rf_skin_500.fit(X_train_s, y_train_s)\n")
                new_source.append("y_pred_rf500_s = rf_skin_500.predict(X_test_s)\n")
                new_source.append("r_rf500_skin = evaluate('RF-500 (Skincare)', y_test_s, y_pred_rf500_s)\n")
                new_source.append("print(f\"  RF-500 Accuracy: {r_rf500_skin['Accuracy']*100:.2f}%\")\n")
                new_source.append("\n")
                new_source.append("# pick best skincare model\n")
                new_source.append("if r_rf500_skin['Accuracy'] >= r_rf_skin['Accuracy']:\n")
                new_source.append("    best_skin_name = 'RF-500'\n")
                new_source.append("    best_skin_metrics = r_rf500_skin\n")
                new_source.append("    y_pred_best_skin = y_pred_rf500_s\n")
                new_source.append("else:\n")
                new_source.append("    best_skin_name = 'RF-300'\n")
                new_source.append("    best_skin_metrics = r_rf_skin\n")
                new_source.append("    y_pred_best_skin = y_pred_rf_s\n")
                continue
            
            if skip:
                continue
            
            new_source.append(line)
        cell['source'] = new_source

with open('model_training.ipynb', 'w', encoding='utf-8') as f:
    json.dump(nb, f, indent=1)

print("Replaced HistGradientBoosting with RF-500 (handles sparse data natively, no .toarray() needed)")
