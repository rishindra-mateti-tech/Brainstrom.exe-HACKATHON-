# CUTIeS-IQ: Deployed Ingredient Intelligence System

AI-assisted skincare platform that evaluates cosmetic ingredients against a trained classifier, a user's skin profile, and real-time climate data, instead of relying on marketing claims.

🌐 **Live**: [cuties-iq.vercel.app](https://cuties-iq.vercel.app) · **ML backend**: [cutis-iq-ml.onrender.com](https://cutis-iq-ml.onrender.com)

It started as a hackathon prototype (`version_1/`) and a university ML coursework notebook (`v2_as_ML_finalproject/`), and was rebuilt here into an actually-deployed product: fixing OAuth buttons that didn't do anything, replacing a hardcoded admin password with real database-backed authorization, fixing a regulatory safety check that was silently failing to catch prohibited ingredients, retraining the classifier to fit on a free-tier host, building a scrape-and-Gemini fallback for ingredients the model doesn't recognize, adding per-user API key support, and deploying the whole thing across Vercel, Render, and Supabase.

---

## Key Features

### Computer Vision OCR
- **Automated Ingredient Extraction**: Powered by **Tesseract.js**, users can upload photos of ingredient labels for instant extraction.
- **Client-Side Processing**: Fast, privacy-focused extraction without reliance on heavy server-side image processing.

### Trained Ingredient Classifier + Regulatory Safety Check
- **`ml_service`**: a FastAPI service running a scikit-learn model (Random Forest + TF-IDF) trained on the EU's public CosIng cosmetic ingredient database, predicting each ingredient's function and cross-checking it against the CosIng Annex II/III prohibited and restricted substance lists.
- **Unknown-ingredient fallback**: when the classifier doesn't recognize an ingredient, the app scrapes supplementary facts from INCIDecoder, then has Gemini synthesize a personalized assessment grounded in those facts (or, if none are found, a clearly-caveated AI estimate). Every result is labeled **Verified** or **AI Estimate** in the UI, never presented with false confidence. See [`/legal/data-sources`](https://cuties-iq.vercel.app/legal/data-sources) for the full disclosure.

### Weighted Priority Scoring
- A custom algorithm calculates a "Goal Match Score" using a multi-tiered weighting system: **P1 (Primary Goal)**: 50%, **P2 (Secondary Goal)**: 37%, **P3 (Tertiary Goal)**: 13%, combining base ingredient safety with goal effectiveness.

### Climate Intelligence
- Integrated with **Open-Meteo API** and IP geolocation (**IPAPI**) to adjust suitability scores based on season and climate (e.g. flagging humectant deficiencies in dry/winter climates).

### Persistent Ingredient Memory
- Tracks historical reactions and stored allergen profiles via **Supabase**, automatically flagging ingredients the user has previously reported as problematic.

### Bring Your Own API Key (BYOK)
- Users can save their own Gemini/OpenAI/Anthropic API key in Settings, encrypted at rest (**AES-256-GCM**) and never exposed back to the client. Currently only the Gemini key is actually consumed, by the unknown-ingredient fallback above.

### Real Authentication
- Google OAuth and email/password via Supabase Auth. The admin panel is gated by a real `is_admin` database flag checked server-side (via `SECURITY DEFINER` Postgres functions), not a client-side flag.

---

## Architecture

| Layer | Stack |
|---|---|
| Frontend | Next.js 16 (App Router), TypeScript, Tailwind CSS, shadcn/ui, Framer Motion |
| Backend / Auth / DB | Supabase (PostgreSQL), Google OAuth + email/password |
| ML backend | FastAPI + scikit-learn (`ml_service/`), containerized, deployed on Render |
| AI fallback | Google Gemini (`gemini-flash-latest`) via direct REST calls |
| Scraping | `requests` + `BeautifulSoup` against INCIDecoder (see the data-sources disclosure page) |
| Security | AES-256-GCM encryption at rest for BYOK keys, server-side `is_admin` authorization |

---

## Getting Started

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

`GET /health` should report `models_loaded: true` once training completes. Full endpoint reference in [`ml_service/README.md`](./ml_service/README.md).

---

## Database Schema

Stored across several relational tables in Supabase (see `supabase/*.sql` for the full migrations):
- `profiles`: Core user skin profiles, location data, and an `is_admin` flag (server-controlled only; see `admin_schema.sql`).
- `product_history`: Historical analysis results and scoring.
- `allergies`: User-defined allergen tracking.
- `ingredient_feedback`: Crowdsourced/personal reaction memory.
- `skincare_goals`: User-defined priorities for the scoring algorithm.
- `user_api_keys`: Encrypted per-user BYOK API keys (`user_api_keys.sql`).

---

## Credits

Built for the Make-IT-Wright Hackathon 2026 ("Hack Squad," Russ 158): Rishindra Mateti, Lohitha Donuri, Akanksha Padigapati, Varshitha Chennu, Mohith Kovvuri. Winner, **"Most Likely to Ship" Award (Reynolds & Reynolds)**.
