import json

with open('model_training.ipynb', 'r', encoding='utf-8') as f:
    nb = json.load(f)

# Cell 6 (index 5) is the EDA code cell
eda_code = """top25 = df['Primary_Function'].value_counts().head(25)

fig, ax = plt.subplots(figsize=(12, 7))
bars = ax.barh(top25.index[::-1], top25.values[::-1], color='#4A90D9', alpha=0.85)
ax.set_xlabel('Number of Ingredients', fontsize=12)
ax.set_title('Top 25 Most Common Primary Cosmetic Functions in CosIng Dataset', fontsize=13)
ax.grid(axis='x', alpha=0.3)
for bar, val in zip(bars, top25.values[::-1]):
    ax.text(val + 50, bar.get_y() + bar.get_height()/2, str(val), va='center', fontsize=9)
plt.tight_layout()
plt.savefig('eda_class_distribution.png', dpi=150, bbox_inches='tight')
plt.show()

print(f"\\nTop 5 functions:\\n{top25.head().to_string()}")
print(f"\\nLeast common function count: {df['Primary_Function'].value_counts().min()}")"""

lines = eda_code.split('\n')
nb['cells'][5]['source'] = [l + '\n' if i < len(lines)-1 else l for i, l in enumerate(lines)]
nb['cells'][5]['outputs'] = []
nb['cells'][5]['execution_count'] = None

with open('model_training.ipynb', 'w', encoding='utf-8') as f:
    json.dump(nb, f, indent=1)

print("EDA cell updated to horizontal bars, top 25")
