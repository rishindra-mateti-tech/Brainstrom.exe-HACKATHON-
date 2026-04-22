import json

with open('model_training.ipynb', 'r', encoding='utf-8') as f:
    nb = json.load(f)

# Cell 8: RF-300 on all data (clean replacement)
cell8_code = """# optimized RF with 300 trees on all data
print("Training RF (300 trees) on all data...")
rf_300 = RandomForestClassifier(
    n_estimators=300, class_weight='balanced_subsample',
    random_state=42, n_jobs=-1)
rf_300.fit(X_train, y_train)
y_pred_rf300 = rf_300.predict(X_test)
r_rf_all = evaluate('RF-300 (All Data)', y_test, y_pred_rf300)

best_all_name = 'RF-300'
best_all_metrics = r_rf_all

print(f"RF-300 All Data Results:")
print(f"  Accuracy:  {r_rf_all['Accuracy']*100:.2f}%")
print(f"  Precision: {r_rf_all['Precision']:.4f}")
print(f"  Recall:    {r_rf_all['Recall']:.4f}")
print(f"  F1 Score:  {r_rf_all['F1 Score']:.4f}")"""

lines = cell8_code.split('\n')
nb['cells'][8]['source'] = [line + '\n' if i < len(lines)-1 else line for i, line in enumerate(lines)]
nb['cells'][8]['outputs'] = []
nb['cells'][8]['execution_count'] = None

with open('model_training.ipynb', 'w', encoding='utf-8') as f:
    json.dump(nb, f, indent=1)

print("Cell 8 replaced cleanly")
