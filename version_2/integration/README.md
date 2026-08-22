# CUTIeS-IQ 🧴✨

**AI-Powered Skincare Intelligence Platform**

CUTIeS-IQ is a high-performance skincare analysis platform that leverages computer vision, a trained ingredient-function classifier, and environmental intelligence to evaluate product ingredients. Built for the **Brainstrom.exe Hackathon 2026**, it provides hyper-personalized suitability scores based on user skin profiles, real-time climate data, and weighted skincare goals.

🌐 **Live**: [cuties-iq.vercel.app](https://cuties-iq.vercel.app) · ML backend: [cutis-iq-ml.onrender.com](https://cutis-iq-ml.onrender.com)

---

## 🌟 Key Features

### 🔍 Computer Vision OCR
- **Automated Ingredient Extraction**: Powered by **Tesseract.js**, users can upload photos of ingredient labels for instant extraction.
- **Client-Side Processing**: Fast, privacy-focused extraction without reliance on heavy server-side image processing.

### 🧠 Advanced Analysis Engine
- **Weighted Priority Scoring**: A custom algorithm that calculates a "Goal Match Score" using a multi-tiered weighting system:
    - **P1 (Primary Goal)**: 50%
    - **P2 (Secondary Goal)**: 37%
    - **P3 (Tertiary Goal)**: 13%
- **Holistic Verdicts**: Combines base suitability (skin safety) with goal effectiveness for a comprehensive product evaluation.

### 🌡️ Climate Intelligence
- **Real-Time Environmental Data**: Integrated with **Open-Meteo API** and **IP geolocation** (IPAPI) to fetch local meteorological conditions.
- **Contextual Recommendations**: Automatically adjusts suitability scores based on Season and Climate Type (e.g., flagging humectant deficiencies in dry/winter climates).

### 💾 Persistent Ingredient Memory
- **Safety Engine**: Tracks historical reactions and stored allergen profiles via **Supabase**.
- **Allergy & Irritation Alerts**: Automatically flags ingredients that the user has previously reported as problematic.

### 🧪 Trained Ingredient Classifier + Regulatory Safety Check
- **`ml_service`**: a FastAPI service running a scikit-learn model (RandomForest + TF-IDF) trained on the EU's public CosIng cosmetic ingredient database, predicting each ingredient's function and cross-checking it against the CosIng Annex II/III prohibited and restricted substance lists.
- **Unknown-ingredient fallback**: when the classifier doesn't recognize an ingredient, the app scrapes supplementary facts from INCIDecoder, then has Gemini synthesize a personalized assessment grounded in those facts (or, if none are found, a clearly-caveated AI estimate). Every result is labeled **Verified** or **AI Estimate** in the UI — never presented with false confidence. See [`/legal/data-sources`](https://cuties-iq.vercel.app/legal/data-sources) for the full disclosure.

### 🔑 Bring Your Own API Key (BYOK)
Users can save their own Gemini/OpenAI/Anthropic API key in **Settings**, encrypted at rest (AES-256-GCM) and never exposed back to the client. Currently only the Gemini key is actually consumed (by the unknown-ingredient fallback above).

### 🔐 Real Authentication
Google OAuth and email/password via Supabase Auth. The admin panel is gated by a real `is_admin` database flag checked server-side (via `SECURITY DEFINER` Postgres functions), not a client-side flag.

---

## 🛠️ Tech Stack

- **Frontend**: [Next.js 16](https://nextjs.org/) (App Router), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS](https://tailwindcss.com/)
- **Backend/Auth/DB**: [Supabase](https://supabase.com/) (PostgreSQL)
- **ML backend**: [FastAPI](https://fastapi.tiangolo.com/) + [scikit-learn](https://scikit-learn.org/) (`ml_service/`), deployed on [Render](https://render.com/)
- **AI fallback**: [Google Gemini](https://ai.google.dev/) (`gemini-flash-latest`), via direct REST calls
- **Scraping**: `requests` + `BeautifulSoup` against [INCIDecoder](https://incidecoder.com) (see the data-sources disclosure page for details)
- **OCR/CV**: [Tesseract.js](https://tesseract.projectnaptha.com/) (client-side)
- **APIs**: [Open-Meteo](https://open-meteo.com/), [IPAPI](https://ipapi.co/)
- **UI/UX**: [shadcn/ui](https://ui.shadcn.com/), [Framer Motion](https://www.framer.com/motion/)

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.11+ (for `ml_service`)
- A Supabase project

### 1. Frontend

```bash
git clone https://github.com/rishindra-mateti-tech/Brainstrom.exe-HACKATHON-.git
cd "Brainstrom.exe-HACKATHON-/version_2/integration"
npm install
```

Create a `.env.local` file:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Server-only -- never expose these to the browser
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
API_KEY_ENCRYPTION_SECRET=generate_with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
GEMINI_API_KEY=your_project_level_gemini_key   # fallback used when a user hasn't saved their own

NEXT_PUBLIC_ML_API_URL=http://localhost:8000   # or your deployed ml_service URL
```

Run the migrations in `supabase/` via the Supabase SQL editor (`schema.sql`, `goals_schema.sql`, `ml_tracking.sql`, `admin_schema.sql`, `admin_stats_rpc.sql`, `user_api_keys.sql`), then:

```bash
npm run dev
```

### 2. ML backend (`ml_service/`)

```bash
cd ml_service
pip install -r requirements.txt
python train.py          # trains the classifier from the CosIng dataset in ../../v2_as_ML_finalproject
uvicorn main:app --reload --port 8000
```

`GET /health` should report `models_loaded: true` once training completes.

---

## 📦 Database Schema

The platform stores data across several relational tables in Supabase (see `supabase/*.sql` for the full migrations):
- `profiles`: Core user skin profiles, location data, and an `is_admin` flag (server-controlled only — see `admin_schema.sql`).
- `product_history`: Historical analysis results and scoring.
- `allergies`: User-defined allergen tracking.
- `ingredient_feedback`: Crowdsourced/Personal reaction memory.
- `skincare_goals`: User-defined priorities for the scoring algorithm.
- `user_api_keys`: Encrypted per-user BYOK API keys (`user_api_keys.sql`).

---

## 🎨 UI Design Philosophy

- **Vibrant Aesthetics**: Features a modern pink/cyan theme with sleek glassmorphism effects.
- **Responsive Layout**: Fully optimized for mobile and desktop analysis.
- **Micro-interactions**: Smooth transitions and state changes powered by Framer Motion.

---

## 🏆 Hackathon Team: Hack Squad
**Location**: Russ 158

1. **Rishindra Mateti** - [mateti.7@wright.edu](mailto:mateti.7@wright.edu)
2. **Lohitha Donuri** - [lohith.3@wright.edu](mailto:lohith.3@wright.edu)
3. **Akanksha Padigapati** - [padigapati.2@wright.edu](mailto:padigapati.2@wright.edu)
4. **Varshitha Chennu** - [chennu.9@wright.edu](mailto:chennu.9@wright.edu)
5. **Mohith Kovvuri** - [kovvuri.6@wright.edu](mailto:kovvuri.6@wright.edu)

---
Built for **Make-It-Wright Hackathon 2026** at Wright State University.
