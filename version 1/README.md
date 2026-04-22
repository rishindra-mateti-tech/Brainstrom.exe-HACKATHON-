# CUTIeS-IQ 🧴✨

**AI-Powered Skincare Intelligence Platform**

CUTIeS-IQ is an intelligent skincare analysis platform that evaluates product ingredients based on your unique skin profile, climate, and personal skincare goals. Built for the Make-it-Wright Hackathon.

## 🌟 Features

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

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **OCR**: Tesseract.js
- **UI Components**: shadcn/ui
-  **APIs**: Open-Meteo, IPAPI
- **Animations**: Framer Motion

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Supabase account

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

3. **Environment Setup**
Create `.env.local` file:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Run development server**
```bash
npm run dev
```

Visit `http://localhost:3000`

## 📦 Database Setup

The app uses Supabase with the following tables:
- `profiles` - User skin profiles
- `product_history` - Analysis history
- `allergies` - User allergen tracking
- `ingredient_feedback` - Reaction memory
- `user_goals` - Priority-based goals

## 🎨 UI Design

- **Light Mode**: Clean white/gray with pink accents
- **Dark Mode**: Slate-900 → Blue-950 gradient with cyan accents
- **Theme**: Matches homepage branding with modern glassmorphism effects

## 🏆 Hackathon Team

**Hack Squad** - Location: Russ 158

1. Rishindra Mateti - [mateti.7@wright.edu](mailto:mateti.7@wright.edu)
2. Lohitha Donuri - [lohith.3@wright.edu](mailto:lohith.3@wright.edu)
3. Akanksha Padigapati - [padigapati.2@wright.edu](mailto:padigapati.2@wright.edu)
4. Varshitha Chennu - [chennu.9@wright.edu](mailto:chennu.9@wright.edu)
5. Mohith Kovvuri - [kovvuri.6@wright.edu](mailto:kovvuri.6@wright.edu)

## 📄 License

Built for Make - It - Wright hackathon 2026

## 🙏 Acknowledgments

Special thanks to Wright State University and Make-It_Wright Hackathon organizers!
