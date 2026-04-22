import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.feature_extraction.text import TfidfVectorizer
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

# Grouping into 3 super-categories
def group_skincare(label):
    if label in ['HUMECTANT', 'MOISTURISING', 'SKIN CONDITIONING']:
        return 'HYDRATION & CONDITIONING'
    elif label in ['ANTIOXIDANT', 'SKIN PROTECTING', 'UV ABSORBER']:
        return 'PROTECTION'
    else:
        return 'RENEWAL & TREATMENT' # ASTRINGENT, ANTI-SEBUM, ANTI-SEBORRHEIC, EXFOLIATING

df_skin['Grouped_Function'] = df_skin['Primary_Function'].apply(group_skincare)
print("Grouped Distribution:")
print(df_skin['Grouped_Function'].value_counts())

le_skin = LabelEncoder()
y_skin = le_skin.fit_transform(df_skin['Grouped_Function'])

tf_n = TfidfVectorizer(max_features=8000, analyzer='char_wb', ngram_range=(2, 6))
tf_d = TfidfVectorizer(max_features=6000, analyzer='word', ngram_range=(1, 3))
X_skin = hstack([tf_n.fit_transform(df_skin['INCI name']),
                 tf_d.fit_transform(df_skin['Description'])])

X_tr_s, X_te_s, y_tr_s, y_te_s = train_test_split(
    X_skin, y_skin, test_size=0.2, random_state=42, stratify=y_skin)

rf_skin = RandomForestClassifier(n_estimators=300, class_weight='balanced_subsample',
                                 random_state=42, n_jobs=-1)
rf_skin.fit(X_tr_s, y_tr_s)
y_pred_rf_s = rf_skin.predict(X_te_s)
acc = accuracy_score(y_te_s, y_pred_rf_s)
print(f"RF-300 Grouped Accuracy: {acc*100:.2f}%")
