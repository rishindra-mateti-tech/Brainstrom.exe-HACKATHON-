import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.svm import LinearSVC
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from scipy.sparse import hstack
from sklearn.metrics import accuracy_score

dataset_path = "dataset_for_v2/COSING_Ingredients-Fragrance Inventory_v2.csv"
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

skin_care_classes = [
    'SKIN CONDITIONING', 'ANTIOXIDANT', 'HUMECTANT', 'SKIN PROTECTING',
    'ASTRINGENT', 'ANTI-SEBUM', 'ANTI-SEBORRHEIC', 'EXFOLIATING',
    'UV ABSORBER', 'MOISTURISING'
]
df_skin = df[df['Primary_Function'].isin(skin_care_classes)].copy()

le_skin = LabelEncoder()
y_skin = le_skin.fit_transform(df_skin['Primary_Function'])

tf_n = TfidfVectorizer(max_features=10000, analyzer='char_wb', ngram_range=(2, 6))
tf_d = TfidfVectorizer(max_features=10000, analyzer='word', ngram_range=(1, 3))
X_skin = hstack([tf_n.fit_transform(df_skin['INCI name']),
                 tf_d.fit_transform(df_skin['Description'])])

X_tr_s, X_te_s, y_tr_s, y_te_s = train_test_split(
    X_skin, y_skin, test_size=0.2, random_state=42, stratify=y_skin)

print("Testing models for >80% accuracy on skincare data:")

# LinearSVC
svc = LinearSVC(C=1.0, random_state=42, max_iter=2000, class_weight='balanced')
svc.fit(X_tr_s, y_tr_s)
print(f"LinearSVC Balanced: {accuracy_score(y_te_s, svc.predict(X_te_s)):.4f}")

svc2 = LinearSVC(C=0.5, random_state=42, max_iter=2000)
svc2.fit(X_tr_s, y_tr_s)
print(f"LinearSVC Standard: {accuracy_score(y_te_s, svc2.predict(X_te_s)):.4f}")

# LogisticRegression
lr = LogisticRegression(max_iter=1000, class_weight='balanced', C=10)
lr.fit(X_tr_s, y_tr_s)
print(f"LogisticRegression Balanced C=10: {accuracy_score(y_te_s, lr.predict(X_te_s)):.4f}")

lr2 = LogisticRegression(max_iter=1000, C=10)
lr2.fit(X_tr_s, y_tr_s)
print(f"LogisticRegression Standard C=10: {accuracy_score(y_te_s, lr2.predict(X_te_s)):.4f}")

# Multi-layer Perceptron (Neural Network)
from sklearn.neural_network import MLPClassifier
mlp = MLPClassifier(hidden_layer_sizes=(100,), max_iter=300, random_state=42)
mlp.fit(X_tr_s, y_tr_s)
print(f"MLP (Neural Net): {accuracy_score(y_te_s, mlp.predict(X_te_s)):.4f}")
