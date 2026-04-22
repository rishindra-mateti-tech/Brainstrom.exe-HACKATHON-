# CUTIeS-IQ 🧴✨

**AI-Powered Skincare Intelligence Platform**

CUTIeS-IQ is a high-performance skincare analysis platform that leverages computer vision and environmental intelligence to evaluate product ingredients. Built for the **Brainstrom.exe Hackathon 2026**, it provides hyper-personalized suitability scores based on user skin profiles, real-time climate data, and weighted skincare goals.

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

---

## 🛠️ Tech Stack

- **Frontend**: [Next.js 16](https://nextjs.org/) (App Router), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS](https://tailwindcss.com/)
- **Backend/Auth**: [Supabase](https://supabase.com/) (PostgreSQL)
- **OCR/CV**: [Tesseract.js](https://tesseract.projectnaptha.com/)
- **APIs**: [Open-Meteo](https://open-meteo.com/), [IPAPI](https://ipapi.co/)
- **UI/UX**: [shadcn/ui](https://ui.shadcn.com/), [Framer Motion](https://www.framer.com/motion/)

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Supabase Project

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/rishindra-mateti-tech/Brainstrom.exe-HACKATHON-.git
cd CutisIQ
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Configuration**
Create a `.env.local` file:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Launch Development Server**
```bash
npm run dev
```

---

## 📦 Database Schema

The platform stores data across several relational tables in Supabase:
- `profiles`: Core user skin profiles and location data.
- `product_history`: Historical analysis results and scoring.
- `allergies`: User-defined allergen tracking.
- `ingredient_feedback`: Crowdsourced/Personal reaction memory.
- `skincare_goals`: User-defined priorities for the scoring algorithm.

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
