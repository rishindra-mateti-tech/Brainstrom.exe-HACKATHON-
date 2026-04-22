import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
from scipy.sparse import hstack

# Load dataset
dataset_path = "dataset_for_v2/COSING_Ingredients-Fragrance Inventory_v2.csv"
print("Loading dataset...")
df = pd.read_csv(dataset_path)

# Cleaning logic
df['INCI name'] = df['INCI name'].astype(str).str.strip().str.upper()
df = df.dropna(subset=['INCI name'])
df = df[df['INCI name'] != 'NAN']
df['Function'] = df['Function'].fillna('UNKNOWN')

# Grouping logic
def get_primary_function(text):
    if not text: return 'UNKNOWN'
    return text.split(',')[0].strip().upper()

df['Primary_Function'] = df['Function'].apply(get_primary_function)
df['Primary_Function'] = df['Primary_Function'].apply(lambda x: 'SKIN CONDITIONING' if x.startswith('SKIN CONDITIONING') else x)

# Strict Skin-Care Categories
skin_care_classes = [
    'SKIN CONDITIONING', 'ANTIOXIDANT', 'HUMECTANT', 'SKIN PROTECTING',
    'ASTRINGENT', 'ANTI-SEBUM', 'ANTI-SEBORRHEIC', 'EXFOLIATING',
    'UV ABSORBER', 'MOISTURISING'
]

# Filter for Pure Skin-Care Only
df_focus = df[df['Primary_Function'].isin(skin_care_classes)].copy()
print(f"Dataset filtered to {len(df_focus)} Skin-Care ingredients.")

# Target encoding
le = LabelEncoder()
y = le.fit_transform(df_focus['Primary_Function'])

# Description cleanup (using the correct column name)
desc_col = 'Chem/IUPAC Name / Description'
df_focus[desc_col] = df_focus[desc_col].fillna('UNKNOWN').astype(str)

# Feature Engineering
print("Vectorizing data...")
tf1 = TfidfVectorizer(max_features=8000, analyzer='char_wb', ngram_range=(2, 6))
tf2 = TfidfVectorizer(max_features=6000, analyzer='word', ngram_range=(1, 3))

X = hstack([
    tf1.fit_transform(df_focus['INCI name']),
    tf2.fit_transform(df_focus[desc_col])
])

# Split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

# Model Training
print("Training Optimized Random Forest (300 Trees)...")
rf = RandomForestClassifier(n_estimators=300, class_weight='balanced_subsample', random_state=42, n_jobs=-1)
rf.fit(X_train, y_train)

# Metrics
y_pred = rf.predict(X_test)
acc = accuracy_score(y_test, y_pred)
pre = precision_score(y_test, y_pred, average='weighted', zero_division=0)
rec = recall_score(y_test, y_pred, average='weighted', zero_division=0)
f1 = f1_score(y_test, y_pred, average='weighted', zero_division=0)

print("\n" + "="*50)
print("  PURE SKIN-CARE MODEL RESULTS")
print("="*50)
print(f"  ACCURACY:  {acc*100:.2f}%")
print(f"  PRECISION: {pre:.4f}")
print(f"  RECALL:    {rec:.4f}")
print(f"  F1 SCORE:  {f1:.4f}")
print("="*50)
