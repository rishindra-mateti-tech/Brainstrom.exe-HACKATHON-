# CutisIQ: Skincare Ingredient Analysis

## 🎬 Demo Video
[![CutisIQ Demo](https://img.shields.io/badge/YouTube-Watch%20Demo-red?style=for-the-badge&logo=youtube)](https://youtu.be/WDVm2PUrfvA)

> Watch our full project walkthrough and demo on YouTube: https://youtu.be/WDVm2PUrfvA

## 📄 Research Paper
[![Research Paper](https://img.shields.io/badge/PDF-Research%20Paper-blue?style=for-the-badge&logo=adobeacrobatreader)](./rishindra_csr.pdf)

Welcome to the CutisIQ repository. This project started as a hackathon build (Version 1) and grew into a full Machine Learning final project (Version 2), the version actively developed and deployed today.

### Version 1: The Hackathon Winner
Built in 24 hours at a hackathon: scan a skincare product's ingredient list and understand what each chemical actually does. Won the hackathon. Code's in the `version_1` folder.

### Version 2: Machine Learning Final Project

Extended from the hackathon prototype into a university Machine Learning course project: a real ingredient-function classifier (TF-IDF + RandomForest) trained on the EU's public CosIng cosmetic database, replacing the static lookup table from v1. Multiple baseline models were compared, and the final pipeline uses a Class Sparsity Reduction Strategy to handle imbalanced data.

Development continued well past the coursework, turning the notebook into an actual deployed product. That included fixing OAuth buttons that didn't do anything, replacing a hardcoded admin password with real database-backed authorization, fixing a regulatory safety check that was silently failing to catch prohibited ingredients, retraining the classifier to fit on a free-tier host, building a scrape-and-Gemini fallback for ingredients the model doesn't recognize (clearly labeled, never presented as verified), adding per-user API key support, and deploying the whole thing across Vercel, Render, and Supabase.

Built solo by **Rishindra Mateti**.

You can find the app in the `version_2 / integration` folder, and the ML coursework notebook in `version_2 / v2_as_ML_finalproject`.

### 🌐 Live App
- **App**: [cuties-iq.vercel.app](https://cuties-iq.vercel.app)
- **ML backend**: [cutis-iq-ml.onrender.com](https://cutis-iq-ml.onrender.com)
