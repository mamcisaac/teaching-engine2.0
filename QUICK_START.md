# Teaching Engine 2.0 - Quick Start Guide

## 🚀 For Emily - Get Started in 5 Minutes

### Prerequisites
- Node.js 18+ installed
- pnpm installed (`npm install -g pnpm`)

### Step 1: Install Dependencies
```bash
cd /Users/michaelmcisaac/Github/teaching-engine2.0
pnpm install
```

### Step 2: Set Up Environment
```bash
cp .env.example .env
# Edit .env if needed (default values work for development)
```

### Step 3: Set Up Database
```bash
# Create and migrate database
pnpm --filter @teaching-engine/database db:migrate

# Seed with your account and Grade 1 curriculum (73 expectations)
pnpm --filter @teaching-engine/database db:seed
```

### Step 4: Start the Application
```bash
# Terminal 1 - Start backend server
cd server && npm run dev

# Terminal 2 - Start frontend
cd client && npm run dev
```

### Step 5: Access the Application
Open your browser to: **http://localhost:5173**

### Your Login Credentials
- **Email**: emily.mcisaac@edu.pe.ca
- **Password**: myhusbandisthebest

## 📚 What's Included

### Verified PEI Grade 1 French Immersion Curriculum
- **73 total expectations** (verified against official PDFs)
- 65 taught in French
- 8 Music expectations taught in English

### Subjects Coverage
- Français langue première: 15 expectations
- Mathématiques: 14 expectations  
- Sciences de la nature: 5 expectations
- Sciences humaines: 7 expectations
- Arts visuels: 4 expectations
- Formation personnelle et sociale: 4 expectations
- Éducation physique: 16 expectations
- Music (English): 8 expectations

## 🛠️ Troubleshooting

### If the server won't start
```bash
# Check if ports are in use
lsof -i :3000  # Backend port
lsof -i :5173  # Frontend port

# Kill processes if needed
kill -9 <PID>
```

### If database is missing
```bash
# Recreate database
rm -f packages/database/prisma/dev.db
pnpm --filter @teaching-engine/database db:migrate
pnpm --filter @teaching-engine/database db:seed
```

### If curriculum is missing
```bash
# Seed just the curriculum
pnpm --filter @teaching-engine/database db:seed:curriculum
```

## 📖 Documentation
- Main documentation: [README.md](README.md)
- Testing guide: [docs/TESTING_GUIDE.md](docs/TESTING_GUIDE.md)
- Claude configuration: [CLAUDE.md](CLAUDE.md)

## 💡 Tips for Emily
1. The onboarding flow will guide you through subject selection
2. All curriculum expectations are pre-loaded and verified
3. Coverage tracking updates automatically as you plan
4. The ETFO lesson planner follows the three-part structure
5. Your selected subjects filter all content throughout the app

## 🆘 Need Help?
- Check the [README.md](README.md) for detailed documentation
- Review [CLAUDE.md](CLAUDE.md) for technical details
- The curriculum database is at: `curriculum/PEI_GRADE1_FRENCH_IMMERSION_FINAL.json`

---
Made with ❤️ by your husband for the best Grade 1 French Immersion teacher in PEI!