# CutisIQ — Skincare Ingredient Intelligence

[![Demo Video](https://img.shields.io/badge/YouTube-Watch%20Demo-red?style=for-the-badge&logo=youtube)](https://youtu.be/WDVm2PUrfvA)
[![Research Paper](https://img.shields.io/badge/PDF-Research%20Paper-blue?style=for-the-badge&logo=adobeacrobatreader)](./rishindra_csr.pdf)

CutisIQ analyzes skincare product ingredients and explains what each one actually does, replacing marketing claims with ingredient-level, personalized insight.

## Project History

I started CutisIQ during the Make-IT-Wright Hackathon 2026, building a working prototype in 24 hours that used OCR to read ingredient labels and match them against a skincare database. It won the **"Most Likely to Ship" Award (Reynolds & Reynolds)**. Code's in `version_1/`.

After the win, I wanted to push the idea further: instead of a static ingredient lookup, could the system learn to predict what an *unfamiliar* ingredient does? I extended it as a graduate Machine Learning course project, training a real ingredient-function classifier (TF-IDF + Random Forest) on the EU's public CosIng database, comparing several baseline models and solving a class-imbalance problem with a Class Sparsity Reduction strategy. That notebook is in `version_2/v2_as_ML_finalproject/`.

Development continued well past the coursework, turning the notebook into an actually-deployed product. That included fixing OAuth buttons that didn't do anything, replacing a hardcoded admin password with real database-backed authorization, fixing a regulatory safety check that was silently failing to catch prohibited ingredients, retraining the classifier to fit on a free-tier host, building a scrape-and-Gemini fallback for ingredients the model doesn't recognize (clearly labeled, never presented as verified), adding per-user API key support, and deploying the whole thing across Vercel, Render, and Supabase. That system is in `version_2/integration/`, see its [README](./version_2/integration/README.md) for the full architecture.

## Live App

- **App**: [cuties-iq.vercel.app](https://cuties-iq.vercel.app)
- **ML backend**: [cutis-iq-ml.onrender.com](https://cutis-iq-ml.onrender.com)

*(The database runs on Supabase's free tier and can pause after a week of inactivity. If the app looks broken, email rishindra.tech@gmail.com and I'll wake it back up.)*

## Credits

**Make-IT-Wright Hackathon 2026 team ("Hack Squad," Russ 158):**
Rishindra Mateti, Lohitha Donuri, Akanksha Padigapati, Varshitha Chennu, Mohith Kovvuri

**ML coursework team:**
Rishindra Mateti, Surya Thota, Tejaswi Reddy Kancharla
