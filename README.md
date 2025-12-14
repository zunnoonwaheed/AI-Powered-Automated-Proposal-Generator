# Proposal Perfect

AI-powered proposal generator using Claude AI. Create professional proposals with intelligent content generation, customizable design, and PDF export.

## Features

- 🤖 AI-powered requirements analysis (Claude Sonnet 4.5)
- 📝 7 strategic questions for better proposal generation
- 🎨 Customizable design (colors, fonts, logos)
- 📄 Professional PDF generation
- 📱 Responsive design
- 💼 Kayi Digital branding

## Tech Stack

- **Frontend**: React + Vite + TypeScript + Tailwind CSS
- **Backend**: Express.js + Node.js
- **AI**: Anthropic Claude API
- **PDF**: Puppeteer
- **UI**: Shadcn UI components

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- Anthropic API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd Proposal-Perfect
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your Anthropic API key:
   ```
   ANTHROPIC_API_KEY=your_api_key_here
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:5000
   ```

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed Vercel deployment instructions.

### Quick Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone)

**Remember to add environment variables in Vercel:**
- `ANTHROPIC_API_KEY` - Your Anthropic API key
- `NODE_ENV` - Set to `production`

## Usage

1. **Upload & Analyze**: Paste requirements or upload file
2. **Answer Questions**: Fill 7 strategic questions for AI
3. **Edit Content**: Customize generated proposal
4. **Design**: Upload logos and adjust colors
5. **Preview & Download**: Generate PDF

## Project Structure

```
├── client/          # React frontend
├── server/          # Express backend
├── shared/          # Shared types and schemas
├── script/          # Build scripts
└── dist/            # Production build
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run check` - TypeScript type checking

## Environment Variables

See `.env.example` for all available variables.

## License

MIT

## Contact

Kayi Digital
- Email: hello@kayi.digital
- Phone: +92 309 0613822
