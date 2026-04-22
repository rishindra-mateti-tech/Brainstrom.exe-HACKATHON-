import json

with open('model_training.ipynb', 'r', encoding='utf-8') as f:
    nb = json.load(f)

print("=== ALL NOTEBOOK OUTPUTS ===\n")
for i, cell in enumerate(nb['cells']):
    if cell['cell_type'] == 'code' and cell.get('outputs'):
        for output in cell['outputs']:
            if output.get('output_type') == 'stream' and output.get('name') == 'stdout':
                text = "".join(output.get('text', []))
                if text.strip():
                    print(f"--- Cell {i+1} ---")
                    print(text)
                    print()
