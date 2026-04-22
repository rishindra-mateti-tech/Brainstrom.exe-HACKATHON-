import pandas as pd
import numpy as np
import warnings
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
from scipy.sparse import hstack

warnings.filterwarnings('ignore')

# Helper: evaluate a model and return metric dict
def evaluate(name, y_true, y_pred):
    return {
        'Model': name,
        'Accuracy': round(accuracy_score(y_true, y_pred), 4),
        'Precision': round(precision_score(y_true, y_pred, average='weighted', zero_division=0), 4),
        'Recall': round(recall_score(y_true, y_pred, average='weighted', zero_division=0), 4),
        'F1': round(f1_score(y_true, y_pred, average='weighted', zero_division=0), 4),
    }

# Load full dataset (same path used in the notebook)
dataset_path = "dataset_for_v2/COSING_Ingredients-Fragrance Inventory_v2.csv"
print("Loading dataset ...")
df = pd.read_csv(dataset_path)
# Basic cleaning
df['INCI name'] = df['INCI name'].astype(str).str.strip().str.upper()
# Ensure description column exists
if 'Description' in df.columns:
    df['Description'] = df['Description'].fillna('').astype(str)
else:
    df['Description'] = ''

# Baseline model – all classes
le_all = LabelEncoder()
y_all = le_all.fit_transform(df['Primary_Function'])
char_vec = TfidfVectorizer(max_features=8000, analyzer='char_wb', ngram_range=(2,6))
word_vec = TfidfVectorizer(max_features=6000, stop_words='english')
X_all = hstack([char_vec.fit_transform(df['INCI name']), word_vec.fit_transform(df['Description'])])
X_train_all, X_test_all, y_train_all, y_test_all = train_test_split(
    X_all, y_all, test_size=0.2, random_state=42, stratify=y_all)
rf_all = RandomForestClassifier(
    n_estimators=300, class_weight='balanced_subsample', random_state=42, n_jobs=-1)
rf_all.fit(X_train_all, y_train_all)
y_pred_all = rf_all.predict(X_test_all)
baseline_metrics = evaluate('Baseline (All 51)', y_test_all, y_pred_all)

# Top-10 model – keep only the 10 most common classes
top10 = df['Primary_Function'].value_counts().head(10).index.tolist()
mask_top10 = df['Primary_Function'].isin(top10)
df_top10 = df[mask_top10].copy()
le_top10 = LabelEncoder()
y_top10 = le_top10.fit_transform(df_top10['Primary_Function'])
X_top10 = hstack([char_vec.fit_transform(df_top10['INCI name']), word_vec.fit_transform(df_top10['Description'])])
X_train_t10, X_test_t10, y_train_t10, y_test_t10 = train_test_split(
    X_top10, y_top10, test_size=0.2, random_state=42, stratify=y_top10)
rf_top10 = RandomForestClassifier(
    n_estimators=300, class_weight='balanced_subsample', random_state=42, n_jobs=-1)
rf_top10.fit(X_train_t10, y_train_t10)
y_pred_t10 = rf_top10.predict(X_test_t10)
top10_metrics = evaluate('Top-10 (Skin Focus)', y_test_t10, y_pred_t10)

# Skin-care only model – filter to the 10 skin classes explicitly
skin_classes = [
    'SKIN CONDITIONING',
    'ANTIOXIDANT',
    'HUMECTANT',
    'SKIN PROTECTING',
    'ASTRINGENT',
    'ANTI-SEBUM',
    'ANTI-SEBORRHEIC',
    'EXFOLIATING',
    'UV ABSORBER',
    'MOISTURISING'
]
# Normalise hyphens to ASCII hyphen
df['Primary_Function'] = df['Primary_Function'].str.replace('-', '-', regex=False)
skin_mask = df['Primary_Function'].isin(skin_classes)
skin_df = df[skin_mask].copy()
print(f"Skin-care subset size: {len(skin_df)} entries, {len(skin_df['Primary_Function'].unique())} classes")
le_skin = LabelEncoder()
y_skin = le_skin.fit_transform(skin_df['Primary_Function'])
X_skin = hstack([char_vec.fit_transform(skin_df['INCI name']), word_vec.fit_transform(skin_df['Description'])])
X_train_skin, X_test_skin, y_train_skin, y_test_skin = train_test_split(
    X_skin, y_skin, test_size=0.2, random_state=42, stratify=y_skin)
# Slightly larger forest for focused set
rf_skin = RandomForestClassifier(
    n_estimators=500, class_weight='balanced_subsample', random_state=42, n_jobs=-1)
rf_skin.fit(X_train_skin, y_train_skin)
y_pred_skin = rf_skin.predict(X_test_skin)
skin_metrics = evaluate('Skin-Care Only (Optimized)', y_test_skin, y_pred_skin)

# Comparative table
compar_df = pd.DataFrame([baseline_metrics, top10_metrics, skin_metrics])
print("\n=== Model Comparison ===")
print(compar_df.to_string(index=False))

# Confusion matrix for skin-care model (optional)
cm = confusion_matrix(y_test_skin, y_pred_skin)
print("\nConfusion Matrix (Skin-Care Only):")
print(cm)
