import json

with open('model_training.ipynb', 'r', encoding='utf-8') as f:
    nb = json.load(f)

# Find the cell with "Accuracy Progression" and update it
for i, cell in enumerate(nb['cells']):
    if cell['cell_type'] == 'code':
        src = ''.join(cell['source'])
        if 'Accuracy Progression' in src:
            # Replace just the progression part
            new_prog = """# Accuracy progression
stages = ['LR', 'DT', 'RF-100', 'RF-300\\n(All Data)', 'XGBoost\\n(All Data)', 'RF-300\\n(Skincare)', 'XGBoost\\n(Skincare)']
accs = [r_lr['Accuracy']*100, r_dt['Accuracy']*100, r_rf['Accuracy']*100,
        r_rf300['Accuracy']*100, r_xgb['Accuracy']*100,
        r_rf_s['Accuracy']*100, r_xgb_s['Accuracy']*100]
clrs = ['#95a5a6','#e74c3c','#f39c12','#3498db','#9b59b6','#27ae60','#2ecc71']

plt.figure(figsize=(12, 5))
bars = plt.bar(stages, accs, color=clrs, edgecolor='black')
for b, v in zip(bars, accs):
    plt.text(b.get_x()+b.get_width()/2, v+1, f'{v:.1f}%', ha='center', fontweight='bold')
plt.ylabel('Accuracy (%)')
plt.title('Accuracy Progression Across Models', fontsize=14)
plt.ylim(0, 100)
plt.tight_layout()
plt.savefig('accuracy_progression.png', dpi=150)
plt.show()"""
            # Keep the per-class F1 part after it
            f1_start = src.find('# Per-class F1')
            if f1_start >= 0:
                f1_part = src[f1_start:]
                full = new_prog + '\n\n' + f1_part
            else:
                full = new_prog
            
            lines = full.split('\n')
            nb['cells'][i]['source'] = [l + '\n' if j < len(lines)-1 else l for j, l in enumerate(lines)]
            nb['cells'][i]['outputs'] = []
            nb['cells'][i]['execution_count'] = None
            print(f"Updated cell {i}")
            break

with open('model_training.ipynb', 'w', encoding='utf-8') as f:
    json.dump(nb, f, indent=1)

print("Added XGBoost bars to progression chart")
