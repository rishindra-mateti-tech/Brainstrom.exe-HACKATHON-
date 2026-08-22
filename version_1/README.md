# CUTIeS-IQ: Version 1 (Hackathon Prototype)

**AI-Powered Skincare Intelligence Platform**

CUTIeS-IQ is an intelligent skincare analysis platform that evaluates product ingredients based on a user's skin profile, climate, and personal skincare goals. Built in 24 hours for the Make-IT-Wright Hackathon 2026.

## Features

**Core**
- OCR ingredient analysis: upload a product photo and extract the ingredient list automatically
- Priority-based goals: up to 3 weighted priority levels for skincare objectives
- Smart recommendations: suitability scoring based on the user's profile
- History tracking: track and compare previously analyzed products
- Allergy alerts: automatic flagging of ingredients the user is sensitive to
- Climate intelligence: recommendations adjusted for the user's environment

**Advanced**
- Ingredient memory: learns from past reactions to specific ingredients
- Goal effectiveness scoring: shows how well a product aligns with each priority goal
- Priority weighting: P1 (50%), P2 (37%), P3 (13%) for product evaluation
- Light/dark theme

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **OCR**: Tesseract.js
- **UI Components**: shadcn/ui
- **APIs**: Open-Meteo, IPAPI
- **Animations**: Framer Motion

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- A Supabase account

### Installation

```bash
git clone https://github.com/rishindra-mateti-tech/Brainstrom.exe-HACKATHON-.git
cd Brainstrom.exe-HACKATHON-/version_1
npm install
```

Create a `.env.local` file:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

```bash
npm run dev
```

Visit `http://localhost:3000`.

## Database Schema

- `profiles`: user skin profiles
- `product_history`: analysis history
- `allergies`: user allergen tracking
- `ingredient_feedback`: reaction memory
- `user_goals`: priority-based goals

## Hackathon Team

**Hack Squad**, Russ 158

1. Rishindra Mateti - [mateti.7@wright.edu](mailto:mateti.7@wright.edu)
2. Lohitha Donuri - [lohith.3@wright.edu](mailto:lohith.3@wright.edu)
3. Akanksha Padigapati - [padigapati.2@wright.edu](mailto:padigapati.2@wright.edu)
4. Varshitha Chennu - [chennu.9@wright.edu](mailto:chennu.9@wright.edu)
5. Mohith Kovvuri - [kovvuri.6@wright.edu](mailto:kovvuri.6@wright.edu)

Winner, "Most Likely to Ship" Award (Reynolds & Reynolds), Make-IT-Wright Hackathon 2026, Wright State University.
