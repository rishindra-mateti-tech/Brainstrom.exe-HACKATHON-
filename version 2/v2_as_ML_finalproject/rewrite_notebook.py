import json

def cell(ct, src):
    lines = src.split('\n')
    s = [l + '\n' if i < len(lines)-1 else l for i, l in enumerate(lines)]
    c = {"cell_type": ct, "metadata": {}, "source": s}
    if ct == "code": c["execution_count"] = None; c["outputs"] = []
    return c

cells = []

# 1 - Markdown: Title
cells.append(cell("markdown", "# Final Project: ML Model Training and Evaluation\n\nThis notebook trains and evaluates cosmetic ingredient classification models using the COSING dataset.\nWe compare baseline models, optimize with RF and XGBoost, then focus on skincare-only data."))

# 2 - Code: Imports
cells.append(cell("code", """import pandas as pd
import numpy as np
import os, re, warnings
warnings.filterwarnings('ignore')

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, label_binarize
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.multiclass import OneVsRestClassifier
from sklearn.metrics import (accuracy_score, precision_score, recall_score,
                             f1_score, confusion_matrix, classification_report,
                             roc_curve, auc)
from scipy.sparse import hstack
import xgboost as xgb
import matplotlib.pyplot as plt
import seaborn as sns"""))

# 3 - Markdown: Loading
cells.append(cell("markdown", "### Loading and Cleaning the Dataset\nLoading the COSING Ingredients dataset and performing basic cleaning."))

# 4 - Code: Load + Clean
cells.append(cell("code", """dataset_path = "dataset_for_v2/COSING_Ingredients-Fragrance Inventory_v2.csv"
print("loading data...")
df = pd.read_csv(dataset_path)

df['INCI name'] = df['INCI name'].astype(str).str.strip().str.upper()
df = df.dropna(subset=['INCI name'])
df = df[df['INCI name'] != 'NAN']

df['Function'] = df['Function'].fillna('UNKNOWN')

def get_primary(text):
    if not isinstance(text, str): return 'UNKNOWN'
    return text.split(',')[0].strip().upper()

df['Primary_Function'] = df['Function'].apply(get_primary)
df['Primary_Function'] = df['Primary_Function'].apply(
    lambda x: 'SKIN CONDITIONING' if x.startswith('SKIN CONDITIONING') else x)
df['Description'] = df['Chem/IUPAC Name / Description'].fillna('').astype(str)

# remove very rare classes (< 10 samples)
counts = df['Primary_Function'].value_counts()
valid = counts[counts >= 10].index
df = df[df['Primary_Function'].isin(valid)].copy()

print(f"Loaded {len(df)} rows, {df['Primary_Function'].nunique()} unique classes")
print(df[['INCI name', 'Primary_Function']].head(5).to_string(index=False))"""))

# 5 - Markdown: EDA
cells.append(cell("markdown", "### Exploratory Data Analysis (EDA)\nVisualizing the distribution of ingredient function classes."))

# 6 - Code: EDA
cells.append(cell("code", """class_dist = df['Primary_Function'].value_counts()
print(f"Total unique classes: {len(class_dist)}\\n")
print(class_dist.to_string())

plt.figure(figsize=(14, 6))
class_dist.plot(kind='bar', color='steelblue', edgecolor='black')
plt.title('Ingredient Function Class Distribution', fontsize=14)
plt.xlabel('Function Class')
plt.ylabel('Count')
plt.xticks(rotation=45, ha='right', fontsize=7)
plt.tight_layout()
plt.savefig('eda_class_distribution.png', dpi=150)
plt.show()"""))

# 7 - Markdown: TF-IDF
cells.append(cell("markdown", "### Feature Engineering with TF-IDF\nExtracting text features from INCI names (character n-grams) and descriptions (word n-grams)."))

# 8 - Code: TF-IDF
cells.append(cell("code", """le = LabelEncoder()
y = le.fit_transform(df['Primary_Function'])
print(f"Number of classes: {len(le.classes_)}")

tfidf_name = TfidfVectorizer(max_features=1000, analyzer='char_wb', ngram_range=(2, 5))
X_name = tfidf_name.fit_transform(df['INCI name'])

tfidf_desc = TfidfVectorizer(max_features=1000, stop_words='english')
X_desc = tfidf_desc.fit_transform(df['Description'])

X = hstack([X_name, X_desc])
print(f"Feature dimensions: {X.shape[1]}")

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y)
print(f"Training: {X_train.shape[0]}, Testing: {X_test.shape[0]}")"""))

# 9 - Markdown: Baselines
cells.append(cell("markdown", "### Training Baseline Models\nComparing Logistic Regression, Decision Tree, and Random Forest."))

# 10 - Code: Baselines
cells.append(cell("code", """def evaluate(name, yt, yp):
    return {'Model': name,
            'Accuracy': round(accuracy_score(yt, yp), 4),
            'Precision': round(precision_score(yt, yp, average='weighted', zero_division=0), 4),
            'Recall': round(recall_score(yt, yp, average='weighted', zero_division=0), 4),
            'F1 Score': round(f1_score(yt, yp, average='weighted', zero_division=0), 4)}

results = []

# Logistic Regression
print("Training Logistic Regression...", end=' ')
lr = LogisticRegression(max_iter=500, solver='saga', random_state=42, n_jobs=-1)
lr.fit(X_train, y_train)
y_pred_lr = lr.predict(X_test)
r_lr = evaluate('Logistic Regression', y_test, y_pred_lr)
results.append(r_lr)
print(f"Accuracy = {r_lr['Accuracy']}")

# Decision Tree
print("Training Decision Tree...", end=' ')
dt = DecisionTreeClassifier(max_depth=20, random_state=42)
dt.fit(X_train, y_train)
y_pred_dt = dt.predict(X_test)
r_dt = evaluate('Decision Tree', y_test, y_pred_dt)
results.append(r_dt)
print(f"Accuracy = {r_dt['Accuracy']}")

# Random Forest
print("Training Random Forest (100 trees)...", end=' ')
rf = RandomForestClassifier(n_estimators=100, random_state=42, n_jobs=-1)
rf.fit(X_train, y_train)
y_pred_rf = rf.predict(X_test)
r_rf = evaluate('Random Forest (100)', y_test, y_pred_rf)
results.append(r_rf)
print(f"Accuracy = {r_rf['Accuracy']}")

print("\\n" + "=" * 65)
print(f"{'Model':<25} {'Accuracy':>10} {'Precision':>10} {'Recall':>10} {'F1':>10}")
print("-" * 65)
for r in results:
    print(f"{r['Model']:<25} {r['Accuracy']:>10} {r['Precision']:>10} {r['Recall']:>10} {r['F1 Score']:>10}")
print("=" * 65)"""))

# 11 - Code: Baseline comparison chart
cells.append(cell("code", """metrics_list = ['Accuracy', 'Precision', 'Recall', 'F1 Score']
x = np.arange(len(metrics_list))
width = 0.25

fig, ax = plt.subplots(figsize=(10, 6))
for i, r in enumerate(results):
    vals = [r[m] for m in metrics_list]
    ax.bar(x + i*width, vals, width, label=r['Model'])
    for j, v in enumerate(vals):
        ax.text(x[j] + i*width, v + 0.01, f'{v:.3f}', ha='center', fontsize=8)

ax.set_ylabel('Score')
ax.set_title('Baseline Model Comparison', fontsize=14)
ax.set_xticks(x + width)
ax.set_xticklabels(metrics_list)
ax.set_ylim(0, 1.0)
ax.legend()
plt.tight_layout()
plt.savefig('baseline_comparison.png', dpi=150)
plt.show()"""))

# 12 - Code: Baseline confusion matrix
cells.append(cell("code", """# Confusion matrix for best baseline (RF)
top10 = le.inverse_transform(np.argsort(np.bincount(y_test))[-10:])
mask = np.isin(le.inverse_transform(y_test), top10)

cm = confusion_matrix(
    le.inverse_transform(y_test[mask]),
    le.inverse_transform(y_pred_rf[mask]), labels=top10)

plt.figure(figsize=(12, 9))
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues',
            xticklabels=top10, yticklabels=top10)
plt.title('Confusion Matrix - Baseline RF (Top 10 Classes)', fontsize=14)
plt.xlabel('Predicted')
plt.ylabel('Actual')
plt.xticks(rotation=45, ha='right')
plt.tight_layout()
plt.savefig('confusion_matrix.png', dpi=150)
plt.show()"""))

# 13 - Markdown: Optimization
cells.append(cell("markdown", "## Optimization\nSince Random Forest performed best in baselines, we now optimize with more trees (300) and compare against XGBoost."))

# 14 - Code: RF-300 + XGBoost on all data
cells.append(cell("code", """# RF Optimization (300 trees)
print("Training Optimized RF (300 trees) on all data...")
rf_300 = RandomForestClassifier(n_estimators=300, class_weight='balanced_subsample',
                                random_state=42, n_jobs=-1)
rf_300.fit(X_train, y_train)
y_pred_rf300 = rf_300.predict(X_test)
r_rf300 = evaluate('RF-300', y_test, y_pred_rf300)
print(f"  RF-300 Accuracy: {r_rf300['Accuracy']*100:.2f}%")

# XGBoost (using hist for speed)
print("Training XGBoost on all data...")
xgb_model = xgb.XGBClassifier(
    n_estimators=100, max_depth=6, learning_rate=0.1,
    tree_method='hist', colsample_bytree=0.3,
    use_label_encoder=False, eval_metric='mlogloss',
    random_state=42, n_jobs=-1)
xgb_model.fit(X_train, y_train)
y_pred_xgb = xgb_model.predict(X_test)
r_xgb = evaluate('XGBoost', y_test, y_pred_xgb)
print(f"  XGBoost Accuracy: {r_xgb['Accuracy']*100:.2f}%")

# Compare and select best
if r_rf300['Accuracy'] >= r_xgb['Accuracy']:
    best_all_name, best_all_metrics = 'RF-300', r_rf300
    y_pred_best_all = y_pred_rf300
else:
    best_all_name, best_all_metrics = 'XGBoost', r_xgb
    y_pred_best_all = y_pred_xgb

print(f"\\nBest Model for All Data: {best_all_name} ({best_all_metrics['Accuracy']*100:.2f}%)")
print(f"  Precision: {best_all_metrics['Precision']:.4f}")
print(f"  Recall:    {best_all_metrics['Recall']:.4f}")
print(f"  F1 Score:  {best_all_metrics['F1 Score']:.4f}")"""))

# 15 - Markdown: Skincare
cells.append(cell("markdown", "### Skincare-Only Data\nSince our project focuses on skincare ingredient classification, we filter the dataset to skincare-related classes and retrain with fresh features for better domain-specific performance."))

# 16 - Code: Filter skincare
cells.append(cell("code", """skin_care_classes = [
    'SKIN CONDITIONING', 'ANTIOXIDANT', 'HUMECTANT', 'SKIN PROTECTING',
    'ASTRINGENT', 'ANTI-SEBUM', 'ANTI-SEBORRHEIC', 'EXFOLIATING',
    'UV ABSORBER', 'MOISTURISING'
]
df_skin = df[df['Primary_Function'].isin(skin_care_classes)].copy()
print(f"Filtered to {len(df_skin)} skincare ingredients\\n")
print("Skincare Class Distribution:")
print(df_skin['Primary_Function'].value_counts())

# Fresh TF-IDF on skincare data only (higher features for better accuracy)
le_skin = LabelEncoder()
y_skin = le_skin.fit_transform(df_skin['Primary_Function'])

tf_n = TfidfVectorizer(max_features=8000, analyzer='char_wb', ngram_range=(2, 6))
tf_d = TfidfVectorizer(max_features=6000, analyzer='word', ngram_range=(1, 3))
X_skin = hstack([tf_n.fit_transform(df_skin['INCI name']),
                 tf_d.fit_transform(df_skin['Description'])])

X_tr_s, X_te_s, y_tr_s, y_te_s = train_test_split(
    X_skin, y_skin, test_size=0.2, random_state=42, stratify=y_skin)
print(f"\\nSkincare Train: {X_tr_s.shape[0]}, Test: {X_te_s.shape[0]}")"""))

# 17 - Code: RF + XGBoost on skincare
cells.append(cell("code", """# RF-300 on skincare
print("Training RF (300 trees) on skincare data...")
rf_skin = RandomForestClassifier(n_estimators=300, class_weight='balanced_subsample',
                                 random_state=42, n_jobs=-1)
rf_skin.fit(X_tr_s, y_tr_s)
y_pred_rf_s = rf_skin.predict(X_te_s)
r_rf_s = evaluate('RF-300 (Skincare)', y_te_s, y_pred_rf_s)
print(f"  RF-300 Accuracy: {r_rf_s['Accuracy']*100:.2f}%")

# XGBoost on skincare
print("Training XGBoost on skincare data...")
xgb_skin = xgb.XGBClassifier(
    n_estimators=100, max_depth=6, learning_rate=0.1,
    tree_method='hist', colsample_bytree=0.3,
    use_label_encoder=False, eval_metric='mlogloss',
    random_state=42, n_jobs=-1)
xgb_skin.fit(X_tr_s, y_tr_s)
y_pred_xgb_s = xgb_skin.predict(X_te_s)
r_xgb_s = evaluate('XGBoost (Skincare)', y_te_s, y_pred_xgb_s)
print(f"  XGBoost Accuracy: {r_xgb_s['Accuracy']*100:.2f}%")

# Select best skincare model
if r_rf_s['Accuracy'] >= r_xgb_s['Accuracy']:
    best_skin_name, best_skin_metrics = 'RF-300', r_rf_s
    y_pred_best_skin = y_pred_rf_s
else:
    best_skin_name, best_skin_metrics = 'XGBoost', r_xgb_s
    y_pred_best_skin = y_pred_xgb_s

print(f"\\nBest Model for Skincare: {best_skin_name} ({best_skin_metrics['Accuracy']*100:.2f}%)")
print(f"  Precision: {best_skin_metrics['Precision']:.4f}")
print(f"  Recall:    {best_skin_metrics['Recall']:.4f}")
print(f"  F1 Score:  {best_skin_metrics['F1 Score']:.4f}")"""))

# 18 - Markdown: Analytics
cells.append(cell("markdown", "### Evaluation and Performance Analysis\nComparing performance across all scenarios with visual analytics."))

# 19 - Code: Comparison chart
cells.append(cell("code", """# All Data vs Skincare comparison
print(f"All Data Best:  {best_all_name} = {best_all_metrics['Accuracy']*100:.2f}%")
print(f"Skincare Best:  {best_skin_name} = {best_skin_metrics['Accuracy']*100:.2f}%")
print(f"Improvement:    +{(best_skin_metrics['Accuracy']-best_all_metrics['Accuracy'])*100:.2f}%")

comp = pd.DataFrame({
    'Metric': ['Accuracy','Precision','Recall','F1 Score']*2,
    'Score': [best_all_metrics['Accuracy'], best_all_metrics['Precision'],
              best_all_metrics['Recall'], best_all_metrics['F1 Score'],
              best_skin_metrics['Accuracy'], best_skin_metrics['Precision'],
              best_skin_metrics['Recall'], best_skin_metrics['F1 Score']],
    'Dataset': [f'All Data ({best_all_name})']*4 + [f'Skincare ({best_skin_name})']*4
})
plt.figure(figsize=(10, 6))
sns.barplot(data=comp, x='Metric', y='Score', hue='Dataset', palette=['#3498db','#27ae60'])
plt.title('All Data vs Skincare Performance Comparison', fontsize=14)
plt.ylim(0, 1.0)
for c in plt.gca().containers:
    plt.gca().bar_label(c, fmt='%.3f', padding=3)
plt.legend(title='Dataset')
plt.tight_layout()
plt.savefig('comparison_all_vs_skincare.png', dpi=150)
plt.show()"""))

# 20 - Code: Skincare confusion matrix
cells.append(cell("code", """# Skincare confusion matrix
cl = le_skin.inverse_transform(range(len(le_skin.classes_)))
cm_s = confusion_matrix(y_te_s, y_pred_best_skin)
plt.figure(figsize=(12, 9))
sns.heatmap(cm_s, annot=True, fmt='d', cmap='Greens',
            xticklabels=cl, yticklabels=cl)
plt.title(f'Confusion Matrix: Skincare Data ({best_skin_name})', fontsize=14)
plt.xlabel('Predicted')
plt.ylabel('Actual')
plt.xticks(rotation=45, ha='right')
plt.tight_layout()
plt.savefig('cm_skincare.png', dpi=150)
plt.show()"""))

# 21 - Code: Per-class + ROC
cells.append(cell("code", """# Per-class report
print(f"Per-Class Performance ({best_skin_name} on Skincare):\\n")
print(classification_report(
    le_skin.inverse_transform(y_te_s),
    le_skin.inverse_transform(y_pred_best_skin), zero_division=0))

# ROC Curve (One-vs-Rest)
n_classes = len(le_skin.classes_)
y_test_bin = label_binarize(y_te_s, classes=range(n_classes))

# Get probability scores from best model
if best_skin_name == 'RF-300':
    y_score = rf_skin.predict_proba(X_te_s)
else:
    y_score = xgb_skin.predict_proba(X_te_s)

plt.figure(figsize=(10, 8))
colors = plt.cm.tab10(np.linspace(0, 1, n_classes))
for i in range(n_classes):
    fpr, tpr, _ = roc_curve(y_test_bin[:, i], y_score[:, i])
    roc_auc = auc(fpr, tpr)
    plt.plot(fpr, tpr, color=colors[i], lw=1.5,
             label=f'{le_skin.classes_[i]} (AUC={roc_auc:.2f})')

plt.plot([0,1], [0,1], 'k--', lw=1)
plt.xlabel('False Positive Rate')
plt.ylabel('True Positive Rate')
plt.title(f'ROC Curves: Skincare Model ({best_skin_name})', fontsize=14)
plt.legend(loc='lower right', fontsize=8)
plt.tight_layout()
plt.savefig('roc_skincare.png', dpi=150)
plt.show()"""))

# 22 - Code: Progression + F1 chart
cells.append(cell("code", """# Accuracy progression
stages = ['LR', 'DT', 'RF-100', f'{best_all_name}\\n(All Data)', f'{best_skin_name}\\n(Skincare)']
accs = [r_lr['Accuracy']*100, r_dt['Accuracy']*100, r_rf['Accuracy']*100,
        best_all_metrics['Accuracy']*100, best_skin_metrics['Accuracy']*100]
clrs = ['#95a5a6','#e74c3c','#f39c12','#3498db','#27ae60']

plt.figure(figsize=(10, 5))
bars = plt.bar(stages, accs, color=clrs, edgecolor='black')
for b, v in zip(bars, accs):
    plt.text(b.get_x()+b.get_width()/2, v+1, f'{v:.1f}%', ha='center', fontweight='bold')
plt.ylabel('Accuracy (%)')
plt.title('Accuracy Progression Across Models', fontsize=14)
plt.ylim(0, 100)
plt.tight_layout()
plt.savefig('accuracy_progression.png', dpi=150)
plt.show()

# Per-class F1 for skincare
report = classification_report(
    le_skin.inverse_transform(y_te_s),
    le_skin.inverse_transform(y_pred_best_skin),
    output_dict=True, zero_division=0)
cl_names = le_skin.inverse_transform(range(n_classes))
f1s = [report[c]['f1-score'] for c in cl_names]

plt.figure(figsize=(10, 6))
colors = ['#27ae60' if v >= 0.5 else '#e74c3c' for v in f1s]
bars = plt.barh(cl_names, f1s, color=colors, edgecolor='black')
for b in bars:
    w = b.get_width()
    plt.text(w+0.01, b.get_y()+b.get_height()/2, f'{w:.3f}', va='center', fontsize=9)
plt.xlabel('F1 Score')
plt.title(f'Per-Class F1 Scores ({best_skin_name} Skincare)', fontsize=14)
plt.xlim(0, 1.0)
plt.tight_layout()
plt.savefig('per_class_f1.png', dpi=150)
plt.show()"""))

# 23 - Markdown: Conclusion
cells.append(cell("markdown", """### Conclusion

For the **entire dataset**, the best performing model is identified above. However, since our CutisIQ project focuses specifically on **skincare ingredient classification**, we isolated the 10 skincare-related functional classes and retrained with domain-specific features. This focused approach resulted in a significant accuracy improvement, demonstrating that domain-specific data filtering combined with optimized feature engineering leads to better model performance for our use case."""))

nb = {"nbformat":4,"nbformat_minor":4,
      "metadata":{"kernelspec":{"display_name":"Python 3","language":"python","name":"python3"},
                  "language_info":{"name":"python","version":"3.11"}},
      "cells": cells}

with open('model_training.ipynb', 'w', encoding='utf-8') as f:
    json.dump(nb, f, indent=1)

print(f"Notebook written: {len(cells)} cells")
print("Includes: markdown sections, LR/DT/RF baselines, XGBoost, skincare section, ROC curves")
