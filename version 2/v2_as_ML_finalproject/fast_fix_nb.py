import json

with open('model_training.ipynb', 'r', encoding='utf-8') as f:
    nb = json.load(f)

for cell in nb['cells']:
    if cell['cell_type'] == 'code':
        new_source = []
        for line in cell['source']:
            # Fast XGBoost params
            if "xgb.XGBClassifier(" in line:
                line = line.replace("n_jobs=-1)", "n_jobs=-1, tree_method='hist', n_estimators=50, colsample_bytree=0.2)")
            new_source.append(line)
        cell['source'] = new_source

# Add Confusion Matrix for All Data
code_cm_all = """from sklearn.metrics import confusion_matrix
import seaborn as sns
import matplotlib.pyplot as plt

print(f"Generating Confusion Matrix for All Data ({best_model_name_all})...")
best_model_all = rf_300 if best_model_name_all == "Random Forest (300)" else xgb_model
y_pred_best_all = best_model_all.predict(X_test)

plt.figure(figsize=(10, 8))
cm_all = confusion_matrix(y_test, y_pred_best_all)
sns.heatmap(cm_all, cmap='Blues', xticklabels=False, yticklabels=False)
plt.title(f"Confusion Matrix: All Data ({best_model_name_all})", fontsize=14)
plt.xlabel("Predicted Class")
plt.ylabel("Actual Class")
plt.show()"""

# Add Confusion Matrix for Skincare Data
code_cm_skin = """print(f"Generating Confusion Matrix for Skincare Data ({best_model_name_skin})...")
best_model_skin = rf_300_skin if best_model_name_skin == "Random Forest (300)" else xgb_model_skin
y_pred_best_skin = best_model_skin.predict(X_test_skin)

plt.figure(figsize=(10, 8))
cm_skin = confusion_matrix(y_test_skin, y_pred_best_skin)
sns.heatmap(cm_skin, annot=True, fmt='d', cmap='Greens',
            xticklabels=le.inverse_transform(range(len(le.classes_))),
            yticklabels=le.inverse_transform(range(len(le.classes_))))
plt.title(f"Confusion Matrix: Skincare Data ({best_model_name_skin})", fontsize=14)
plt.xlabel("Predicted Skincare Class")
plt.ylabel("Actual Skincare Class")
plt.xticks(rotation=45, ha='right')
plt.tight_layout()
plt.show()"""

def create_code_cell(source):
    return {
        "cell_type": "code",
        "execution_count": None,
        "metadata": {},
        "outputs": [],
        "source": [line + "\n" if i < len(source.split('\n')) - 1 else line for i, line in enumerate(source.split('\n'))]
    }

# Append the new cells before the final comparison graph (which is the last cell)
final_graph_cell = nb['cells'].pop()
nb['cells'].append(create_code_cell(code_cm_all))
nb['cells'].append(create_code_cell(code_cm_skin))
nb['cells'].append(final_graph_cell)

with open('model_training.ipynb', 'w', encoding='utf-8') as f:
    json.dump(nb, f, indent=1)
