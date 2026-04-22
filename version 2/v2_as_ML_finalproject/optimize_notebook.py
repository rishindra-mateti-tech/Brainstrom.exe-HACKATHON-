import nbformat

notebook_path = 'c:/Users/rishi/OneDrive/Desktop/CutisIQ/version 2/v2_as_ML_finalproject/model_training.ipynb'

with open(notebook_path, 'r', encoding='utf-8') as f:
    nb = nbformat.read(f, as_version=4)

# Find and remove the remaining old cell at what is now index 25
cells_to_remove = set()
for i, cell in enumerate(nb.cells):
    if cell.cell_type == 'code':
        src = cell.source
        # Remove any remaining cells with "TRAIN THE OPTIMIZED SKIN-CARE MODEL" 
        if 'TRAIN THE OPTIMIZED SKIN-CARE MODEL' in src:
            cells_to_remove.add(i)
            print(f"  Removing stale cell at index {i}: {src[:80]}")
        # Remove cells that reference old undefined variables from Section 10
        if 'yf_test' in src or 'yf_pred' in src or 'Xf_train' in src:
            cells_to_remove.add(i)
            print(f"  Removing cell with old vars at index {i}: {src[:80]}")

print(f"\nTotal cells to remove: {len(cells_to_remove)}")

new_cells = [cell for i, cell in enumerate(nb.cells) if i not in cells_to_remove]
nb.cells = new_cells

# Verify
print("\n--- FINAL CELL STRUCTURE ---")
for i, cell in enumerate(new_cells):
    ct = cell.cell_type
    src = cell.source[:90].replace('\n', ' ')
    print(f'Cell {i:3d} [{ct:8s}]: {src}')

with open(notebook_path, 'w', encoding='utf-8') as f:
    nbformat.write(nb, f)

print("\nFinal cleanup complete.")
