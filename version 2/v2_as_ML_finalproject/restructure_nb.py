import json
import copy

with open('model_training.ipynb', 'r', encoding='utf-8') as f:
    nb = json.load(f)

# Filter out all markdown cells
code_cells = [c for c in nb['cells'] if c['cell_type'] == 'code']

# Keep only the first 7 code cells (up to the baseline confusion matrix)
# Cell 0: Imports
# Cell 1: Load Data
# Cell 2: EDA
# Cell 3: TF-IDF
# Cell 4: Train baselines
# Cell 5: Compare baselines
# Cell 6: Confusion Matrix baselines
kept_cells = code_cells[:7]

def create_code_cell(source):
    return {
        "cell_type": "code",
        "execution_count": None,
        "metadata": {},
        "outputs": [],
        "source": [line + "\n" if i < len(source.split('\n')) - 1 else line for i, line in enumerate(source.split('\n'))]
    }

code1 = """import xgboost as xgb
from sklearn.ensemble import RandomForestClassifier

# Optimized Random Forest on All Data
print("Training Optimized Random Forest (300 Trees) on All Data...")
rf_300 = RandomForestClassifier(n_estimators=300, class_weight='balanced_subsample', random_state=42, n_jobs=-1)
rf_300.fit(X_train, y_train)
y_pred_rf = rf_300.predict(X_test)

print("\\nOptimized RF (300 Trees) Results:")
acc_rf = accuracy_score(y_test, y_pred_rf)
pre_rf = precision_score(y_test, y_pred_rf, average='weighted', zero_division=0)
rec_rf = recall_score(y_test, y_pred_rf, average='weighted', zero_division=0)
f1_rf = f1_score(y_test, y_pred_rf, average='weighted', zero_division=0)
print(f"Accuracy: {acc_rf*100:.2f}% | Precision: {pre_rf:.4f} | Recall: {rec_rf:.4f} | F1: {f1_rf:.4f}")

# XGBoost on All Data
print("\\nTraining XGBoost on All Data...")
xgb_model = xgb.XGBClassifier(use_label_encoder=False, eval_metric='mlogloss', random_state=42, n_jobs=-1)
xgb_model.fit(X_train, y_train)
y_pred_xgb = xgb_model.predict(X_test)

print("\\nXGBoost Results:")
acc_xgb = accuracy_score(y_test, y_pred_xgb)
pre_xgb = precision_score(y_test, y_pred_xgb, average='weighted', zero_division=0)
rec_xgb = recall_score(y_test, y_pred_xgb, average='weighted', zero_division=0)
f1_xgb = f1_score(y_test, y_pred_xgb, average='weighted', zero_division=0)
print(f"Accuracy: {acc_xgb*100:.2f}% | Precision: {pre_xgb:.4f} | Recall: {rec_xgb:.4f} | F1: {f1_xgb:.4f}")

# Determine Best Model on All Data
best_acc_all = max(acc_rf, acc_xgb)
best_model_name_all = "Random Forest (300)" if acc_rf >= acc_xgb else "XGBoost"
print(f"\\nBest Model for All Data: {best_model_name_all} with Accuracy: {best_acc_all*100:.2f}%")"""

code2 = """# Select and print skin care only related data
skin_care_classes = [
    'SKIN CONDITIONING', 'ANTIOXIDANT', 'HUMECTANT', 'SKIN PROTECTING',
    'ASTRINGENT', 'ANTI-SEBUM', 'ANTI-SEBORRHEIC', 'EXFOLIATING',
    'UV ABSORBER', 'MOISTURISING'
]

df_skin = df[df['Primary_Function'].isin(skin_care_classes)].copy()
print(f"Filtered Dataset to {len(df_skin)} Skin-Care ingredients.")

print("\\nTop Skincare Classes Distribution:")
print(df_skin['Primary_Function'].value_counts())

# Prepare Skin-Care Data
y_skin = le.fit_transform(df_skin['Primary_Function'])
df_skin[desc_col] = df_skin[desc_col].fillna('UNKNOWN').astype(str)

print("\\nVectorizing Skincare Data...")
X_skin = hstack([
    tf1.fit_transform(df_skin['INCI name']),
    tf2.fit_transform(df_skin[desc_col])
])

X_train_skin, X_test_skin, y_train_skin, y_test_skin = train_test_split(X_skin, y_skin, test_size=0.2, random_state=42, stratify=y_skin)"""

code3 = """# Apply XGBoost and RF 300 for the skin care only related data
print("Training Optimized Random Forest (300 Trees) on Skincare Data...")
rf_300_skin = RandomForestClassifier(n_estimators=300, class_weight='balanced_subsample', random_state=42, n_jobs=-1)
rf_300_skin.fit(X_train_skin, y_train_skin)
y_pred_rf_skin = rf_300_skin.predict(X_test_skin)

print("\\nSkincare RF (300 Trees) Results:")
acc_rf_skin = accuracy_score(y_test_skin, y_pred_rf_skin)
pre_rf_skin = precision_score(y_test_skin, y_pred_rf_skin, average='weighted', zero_division=0)
rec_rf_skin = recall_score(y_test_skin, y_pred_rf_skin, average='weighted', zero_division=0)
f1_rf_skin = f1_score(y_test_skin, y_pred_rf_skin, average='weighted', zero_division=0)
print(f"Accuracy: {acc_rf_skin*100:.2f}% | Precision: {pre_rf_skin:.4f} | Recall: {rec_rf_skin:.4f} | F1: {f1_rf_skin:.4f}")

print("\\nTraining XGBoost on Skincare Data...")
xgb_model_skin = xgb.XGBClassifier(use_label_encoder=False, eval_metric='mlogloss', random_state=42, n_jobs=-1)
xgb_model_skin.fit(X_train_skin, y_train_skin)
y_pred_xgb_skin = xgb_model_skin.predict(X_test_skin)

print("\\nSkincare XGBoost Results:")
acc_xgb_skin = accuracy_score(y_test_skin, y_pred_xgb_skin)
pre_xgb_skin = precision_score(y_test_skin, y_pred_xgb_skin, average='weighted', zero_division=0)
rec_xgb_skin = recall_score(y_test_skin, y_pred_xgb_skin, average='weighted', zero_division=0)
f1_xgb_skin = f1_score(y_test_skin, y_pred_xgb_skin, average='weighted', zero_division=0)
print(f"Accuracy: {acc_xgb_skin*100:.2f}% | Precision: {pre_xgb_skin:.4f} | Recall: {rec_xgb_skin:.4f} | F1: {f1_xgb_skin:.4f}")

# Determine Best Model on Skincare Data
best_acc_skin = max(acc_rf_skin, acc_xgb_skin)
best_model_name_skin = "Random Forest (300)" if acc_rf_skin >= acc_xgb_skin else "XGBoost"
print(f"\\nBest Model for Skincare Data: {best_model_name_skin} with Accuracy: {best_acc_skin*100:.2f}%")"""

code4 = """import matplotlib.pyplot as plt
import seaborn as sns

print(f"Comparing Metrics: Best All Data ({best_model_name_all}) vs Best Skincare Data ({best_model_name_skin})")

comparison_data = {
    'Metric': ['Accuracy', 'Precision', 'Recall', 'F1 Score'] * 2,
    'Score': [best_acc_all, pre_rf if best_acc_all == acc_rf else pre_xgb, rec_rf if best_acc_all == acc_rf else rec_xgb, f1_rf if best_acc_all == acc_rf else f1_xgb] +
             [best_acc_skin, pre_rf_skin if best_acc_skin == acc_rf_skin else pre_xgb_skin, rec_rf_skin if best_acc_skin == acc_rf_skin else rec_xgb_skin, f1_rf_skin if best_acc_skin == acc_rf_skin else f1_xgb_skin],
    'Dataset': ['All Data'] * 4 + ['Skincare Data Only'] * 4
}

comp_df = pd.DataFrame(comparison_data)

plt.figure(figsize=(10, 6))
sns.barplot(data=comp_df, x='Metric', y='Score', hue='Dataset', palette=['#3498db', '#e74c3c'])
plt.title("Model Comparison: All Data vs Skincare Data", fontsize=16, fontweight='bold')
plt.ylim(0, 1.0)
plt.ylabel("Score")
plt.xlabel("Metric")
plt.legend(title='Dataset Focus')
for i in plt.gca().containers:
    plt.gca().bar_label(i, fmt='%.3f', padding=3)
plt.tight_layout()
plt.savefig('comparison_all_vs_skincare.png', dpi=300)
plt.show()"""

kept_cells.extend([
    create_code_cell(code1),
    create_code_cell(code2),
    create_code_cell(code3),
    create_code_cell(code4)
])

nb['cells'] = kept_cells

with open('model_training.ipynb', 'w', encoding='utf-8') as f:
    json.dump(nb, f, indent=1)

print("Successfully restructured notebook!")
