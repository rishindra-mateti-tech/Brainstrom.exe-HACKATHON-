# CutisIQ: Skincare Ingredient Analysis

## 🎬 Demo Video
[![CutisIQ Demo](https://img.shields.io/badge/YouTube-Watch%20Demo-red?style=for-the-badge&logo=youtube)](https://youtu.be/WDVm2PUrfvA)

> Watch our full project walkthrough and demo on YouTube: https://youtu.be/WDVm2PUrfvA

## 📄 Research Paper
[![Research Paper](https://img.shields.io/badge/PDF-Research%20Paper-blue?style=for-the-badge&logo=adobeacrobatreader)](./rishindra_csr.pdf)

Welcome to the CutisIQ repository. This project started as a hackathon build (Version 1) and grew into a full Machine Learning final project (Version 2) — the version actively developed and deployed today.

### Version 1: The Hackathon Winner
Built in 24 hours at a hackathon — scan a skincare product's ingredient list and understand what each chemical actually does. Won the hackathon. Code's in the `version_1` folder.

### Version 2: Machine Learning Final Project — the real thing

After the hackathon win, **Rishindra Mateti** asked his professor to extend the project into a full ML course project, and built it out from there: training a real ingredient-function classifier (TF-IDF + RandomForest) on the EU's public CosIng cosmetic database instead of relying on a static lookup table, comparing baseline models, and optimizing the pipeline with a Class Sparsity Reduction Strategy to handle imbalanced data.

That was just the coursework. Out of genuine interest in the project, Rishindra kept building on it well after the class ended and after graduation — turning the ML notebook into an actual deployed product. That meant going back through the whole app and fixing what a semester of dormancy had left broken: OAuth buttons that didn't do anything, an admin panel secured by nothing more than a hardcoded password, and a regulatory safety check that was silently failing so it wasn't catching prohibited ingredients at all. Beyond fixing what was there, he retrained the classifier so it would actually fit on a free-tier host, built a scrape-and-Gemini fallback for ingredients the model doesn't recognize (clearly labeled so it's never mistaken for a verified result), added per-user API key support, and deployed the whole thing end-to-end across Vercel, Render, and Supabase — all of it solo.

You can find the app in the `version_2 / integration` folder, and the ML coursework notebook in `version_2 / v2_as_ML_finalproject`.

### 🌐 Live App
- **App**: [cuties-iq.vercel.app](https://cuties-iq.vercel.app)
- **ML backend**: [cutis-iq-ml.onrender.com](https://cutis-iq-ml.onrender.com) (free-tier, spins down after 15 min idle — first request after a while may take 30-60s to wake up)

The Supabase database is kept awake automatically by a scheduled GitHub Actions workflow (`.github/workflows/supabase-keepalive.yml`), so the "database pauses after a week of inactivity" issue that used to affect this project is resolved — no need to email anyone to wake it up anymore.
