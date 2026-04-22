import json

with open('model_training.ipynb', 'r', encoding='utf-8') as f:
    nb = json.load(f)

# Cell 10: skincare isolation - remove undersampling, use full data
cell10_code = """# filter to skincare-only classes
skin_care_classes = [
    'SKIN CONDITIONING', 'ANTIOXIDANT', 'HUMECTANT', 'SKIN PROTECTING',
    'ASTRINGENT', 'ANTI-SEBUM', 'ANTI-SEBORRHEIC', 'EXFOLIATING',
    'UV ABSORBER', 'MOISTURISING'
]

df_skin = df[df['Primary_Function'].isin(skin_care_classes)].copy()
print(f"Skincare data: {len(df_skin)} rows")
print(df_skin['Primary_Function'].value_counts())

# fit FRESH encoder and vectorizers on skincare data only
le_skin = LabelEncoder()
y_skin = le_skin.fit_transform(df_skin['Primary_Function'])

tf_name_skin = TfidfVectorizer(max_features=8000, analyzer='char_wb', ngram_range=(2, 6))
tf_desc_skin = TfidfVectorizer(max_features=6000, analyzer='word', ngram_range=(1, 3))

X_skin = hstack([
    tf_name_skin.fit_transform(df_skin['INCI name']),
    tf_desc_skin.fit_transform(df_skin['Description'])
])

X_train_s, X_test_s, y_train_s, y_test_s = train_test_split(
    X_skin, y_skin, test_size=0.2, random_state=42, stratify=y_skin)
print(f"\\nSkincare train: {X_train_s.shape[0]}, test: {X_test_s.shape[0]}")"""

lines = cell10_code.split('\n')
nb['cells'][10]['source'] = [line + '\n' if i < len(lines)-1 else line for i, line in enumerate(lines)]
nb['cells'][10]['outputs'] = []
nb['cells'][10]['execution_count'] = None

with open('model_training.ipynb', 'w', encoding='utf-8') as f:
    json.dump(nb, f, indent=1)

print("Cell 10 fixed - using full skincare data, no undersampling")
