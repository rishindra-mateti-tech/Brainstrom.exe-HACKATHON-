# CUTIeS-IQ 🧴✨

**Academic Project Overview & Hackathon History**

Welcome to the CUTIeS-IQ repository! This codebase serves a dual purpose: it originated as a winning submission for the Brainstrom.exe Hackathon 2026, and has since been significantly expanded for an academic Machine Learning Final Project.

To ensure clear academic grading and review, the repository has been split into two distinct versions:

---

## 📁 Repository Structure

### [Version 1: The Hackathon Baseline]
Located in `/version 1/`.
This folder contains the **exact, unmodified** Next.js codebase that won the hackathon. It utilizes a static logic-based algorithm for skin profile matching and computer vision (Tesseract.js). There are no machine learning capabilities inside Version 1.

### [Version 2: The ML Final Project]
Located in `/version 2/`.
This directory represents the extension of the platform utilizing dynamic Machine Learning, and is split into two parts:

#### 1. `v2_as_ML_finalproject/` **(Grading Directory)**
**Professor / Grader:** Please navigate to this folder to review the core academic submission.
*   **Dataset:** Contains `dataset_for_v2`, a cleaned version of the CosIng dataset.
*   **Model Training & Evaluation:** Open `model_training.ipynb` (Jupyter Notebook). This notebook handles data preprocessing natively and runs a comparative evaluation between **Logistic Regression**, **Decision Trees**, and **Random Forest** algorithms to predict complex cosmetic ingredient functions and safety flags.
*   **Metrics:** The notebook automatically executes and clearly outputs **Accuracy, Precision, Recall, and F1 Scores** for all models, justifying the selection of Random Forest for the final platform.
*   **Environment:** A clear `requirements.txt` is provided for immediate compilation stability.

#### 2. `integration/`
This folder demonstrates how the chosen Random Forest ML model from the assignment was seamlessly hooked into the actual Next.js application! It hosts a FastAPI microservice backend and a unified frontend where users can actively toggle between the V1 heuristic scanner and the new V2 ML engine.

---

## 🚀 Getting Started for Grading

To review the Machine Learning implementation:
1. Navigate into the grading directory:
```bash
cd "version 2/v2_as_ML_finalproject"
```
2. Install the required data science packages:
```bash
pip install -r requirements.txt
```
3. Boot up Jupyter Notebook (using the python module explicitly to avoid Windows PATH errors) or use your IDE's native notebook runner:
```bash
python -m notebook
```
4. Open `model_training.ipynb` and click **"Run All"** to observe data cleaning, active model training, and the explicit final output efficiencies!

---

## 🌟 Hackathon Features (Version 1)

### Core Functionality
- **🔍 OCR Ingredient Analysis** - Upload product photos and extract ingredient lists automatically
- **🎯 Priority-Based Goals** - Set up to 3 priority levels for your skincare objectives
- **🧠 Smart Recommendations** - AI-powered suitability scoring based on your profile
- **📊 History Tracking** - Track and compare products you've analyzed
- **⚠️ Allergy Alerts** - Automatic flagging of ingredients you're sensitive to
- **🌡️ Climate Intelligence** - Personalized recommendations based on your environment

### Advanced Features
- **Ingredient Memory** - Learn from your past reactions to specific ingredients
- **Goal Effectiveness Scoring** - See how well products align with each priority goal
- **Priority Weighting** - P1 (50%), P2 (37%), P3 (13%) for precise product evaluation
- **Dark/Light Mode** - Beautiful pink/white light theme and cyan dark theme

## 🛠️ V1 Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **OCR**: Tesseract.js
- **UI Components**: shadcn/ui
- **APIs**: Open-Meteo, IPAPI
- **Animations**: Framer Motion

## 🏆 Hackathon Team
**Hack Squad** - Location: Russ 158

1. Rishindra Mateti - [mateti.7@wright.edu](mailto:mateti.7@wright.edu)
2. Lohitha Donuri - [lohith.3@wright.edu](mailto:lohith.3@wright.edu)
3. Akanksha Padigapati - [padigapati.2@wright.edu](mailto:padigapati.2@wright.edu)
4. Varshitha Chennu - [chennu.9@wright.edu](mailto:chennu.9@wright.edu)
5. Mohith Kovvuri - [kovvuri.6@wright.edu](mailto:kovvuri.6@wright.edu)

## 📄 License
Built for Make-It-Wright hackathon 2026 and finalized for the Machine Learning Course term project.

## 🙏 Acknowledgments
Special thanks to Wright State University and Make-It-Wright Hackathon organizers!
