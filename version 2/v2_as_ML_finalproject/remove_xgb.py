import json

with open('model_training.ipynb', 'r', encoding='utf-8') as f:
    nb = json.load(f)

for cell in nb['cells']:
    if cell['cell_type'] == 'code':
        new_source = []
        skip_xgb_block = False
        for line in cell['source']:
            # Skip any XGBoost imports
            if "import xgboost as xgb" in line:
                continue
                
            # Start skipping when we see XGBoost training
            if "Training XGBoost on All Data..." in line or "Training XGBoost on Skincare Data..." in line:
                skip_xgb_block = True
                
            # Stop skipping when we hit Determine Best Model
            if "# Determine Best Model" in line:
                skip_xgb_block = False
                
            # If we are in the XGBoost block, skip lines
            if skip_xgb_block:
                continue
                
            # Fix Determine Best Model logic
            if "best_acc_all = max(acc_rf, acc_xgb)" in line:
                line = "best_acc_all = acc_rf\n"
            if "best_model_name_all = \"Random Forest (300)\" if acc_rf >= acc_xgb else \"XGBoost\"" in line:
                line = "best_model_name_all = \"Random Forest (300)\"\n"
                
            if "best_acc_skin = max(acc_rf_skin, acc_xgb_skin)" in line:
                line = "best_acc_skin = acc_rf_skin\n"
            if "best_model_name_skin = \"Random Forest (300)\" if acc_rf_skin >= acc_xgb_skin else \"XGBoost\"" in line:
                line = "best_model_name_skin = \"Random Forest (300)\"\n"

            # Fix Confusion Matrix model selection
            if "best_model_all = rf_300 if best_model_name_all == \"Random Forest (300)\" else xgb_model" in line:
                line = "best_model_all = rf_300\n"
            if "best_model_skin = rf_300_skin if best_model_name_skin == \"Random Forest (300)\" else xgb_model_skin" in line:
                line = "best_model_skin = rf_300_skin\n"
                
            # Fix Plotting logic
            if "Score': [best_acc_all, pre_rf if best_acc_all == acc_rf else pre_xgb," in line:
                line = "    'Score': [best_acc_all, pre_rf, rec_rf, f1_rf] +\n"
            if "[best_acc_skin, pre_rf_skin if best_acc_skin == acc_rf_skin else pre_xgb_skin," in line:
                line = "             [best_acc_skin, pre_rf_skin, rec_rf_skin, f1_rf_skin],\n"

            new_source.append(line)
        cell['source'] = new_source

with open('model_training.ipynb', 'w', encoding='utf-8') as f:
    json.dump(nb, f, indent=1)

print("XGBoost removed successfully.")
