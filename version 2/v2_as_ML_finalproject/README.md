# A Comprehensive Evaluation of Machine Learning Models for Skincare Ingredient Classification with Class Sparsity Reduction

## 🎬 Demo Video
[![CutisIQ Demo](https://img.shields.io/badge/YouTube-Watch%20Demo-red?style=for-the-badge&logo=youtube)](https://youtu.be/WDVm2PUrfvA)

> Watch our full project walkthrough and demo on YouTube: https://youtu.be/WDVm2PUrfvA

## 📄 Research Paper
[![Research Paper](https://img.shields.io/badge/PDF-Research%20Paper-blue?style=for-the-badge&logo=adobeacrobatreader)](./rishindra_csr.pdf)

**Me and My Team:**
*   Rishindra Mateti - U01122471
*   Surya Thota - U01153942
*   Tejaswi Reddy Kancharla - U01126193

---

In this project, we used the CosIng dataset to train models that can predict the function of a cosmetic ingredient based on its INCI name and description. We faced issues with class sparsity (too many small categories), so we implemented a strategy to group these into larger functional categories, which greatly improved our model's performance.

### Files in this folder:
*   `model_training.ipynb`: Our main Jupyter Notebook containing the code, comments, and results.
*   `dataset_for_v2/`: The folder containing our dataset so the code can run properly.
*   `model_training.html`: A pre-run HTML version of the notebook.

### How to run the project:
1.  Make sure the `dataset_for_v2` folder is in the same directory as the notebook.
2.  Open `model_training.ipynb` in Jupyter Notebook.
3.  Click "Restart & Run All" to run the code from top to bottom.

**Important Note:** Sometimes it takes longer to run optimization models like Random Forest with 300 trees and XGBoost on a normal laptop. If you just want to see our final output and graphs without waiting for the code to finish running, please refer to the `model_training.html` file we included in this folder.
