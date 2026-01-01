# Proposal AI - AI-Powered Proposal Generator

Generate professional, customized proposals using AI assistance powered by Claude.

## Features

- 🤖 AI-powered proposal generation using Claude
- 🎨 Customizable design themes and colors
- 📄 PDF export functionality
- ✨ Multiple proposal sections (Timeline, Deliverables, Pricing, etc.)
- 🎯 Interactive section editor

## Deployment on Vercel

### Step 1: Clone and Install

```bash
git clone https://github.com/zunnoonwaheed/AI-Powered-Automated-Proposal-Generator.git
cd AI-Powered-Automated-Proposal-Generator
npm install
```

### Step 2: Environment Variables

1. Get your Anthropic API key from [https://console.anthropic.com/](https://console.anthropic.com/)
2. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
3. Add your API key to `.env`:
   ```
   ANTHROPIC_API_KEY=your_actual_api_key_here
   ```

### Step 3: Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/zunnoonwaheed/AI-Powered-Automated-Proposal-Generator)

Or manually:

1. Push code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "Add New" → "Project"
4. Import your GitHub repository
5. Set project name to: `proposal-ai`
6. Add environment variable:
   - Key: `ANTHROPIC_API_KEY`
   - Value: Your Anthropic API key
7. Click "Deploy"

## Local Development

```bash
npm run dev
```

Access the application at `http://localhost:5175`

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Backend**: Express + Node.js
- **AI**: Anthropic Claude API
- **Styling**: Tailwind CSS
- **PDF Generation**: Puppeteer

## License

MIT
