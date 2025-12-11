# Proposal Perfect - AI-Powered Proposal Generator

## Overview
Proposal Perfect is an AI-powered proposal generator that helps agencies and freelancers create stunning, professional proposals. It features a Kayi Digital-inspired design with modern typography, gradient accents, and sophisticated layouts.

## Current State
The application is fully functional with:
- AI-powered requirements analysis using Claude claude-sonnet-4-20250514
- Premium proposal design system with customizable colors, fonts, and branding
- Interactive section editor with multiple template types
- Live preview of the proposal
- Professional PDF generation using Puppeteer

## Tech Stack
- **Frontend**: React + Vite + TypeScript
- **Backend**: Express.js + TypeScript
- **AI**: Anthropic Claude API (claude-sonnet-4-20250514)
- **PDF Generation**: Puppeteer with system Chromium
- **Styling**: Tailwind CSS + Shadcn UI

## Key Features
1. **Upload Requirements**: Paste text or upload PDF with project requirements
2. **AI Analysis**: Claude analyzes and extracts key information
3. **Auto-Generate**: Creates proposal structure with sections
4. **Edit**: Customize content, colors, logos, and sections
5. **Generate PDF**: Export professional PDF proposal

## Section Types
- Cover Page
- Project Summary
- Deliverables
- Approach
- Timeline
- Why Choose Us (with numbered features)
- Pricing & Terms
- Next Steps
- Contact

## Design Settings
- Color schemes (Kayi Teal, Corporate Blue, Elegant Purple, etc.)
- Logo upload
- Typography (Poppins, Inter, Outfit)
- Header styles (Gradient, Solid, Minimal)

## API Endpoints
- `POST /api/analyze` - Analyze requirements text with AI
- `POST /api/generate-pdf` - Generate PDF from proposal data

## Environment Variables
- `ANTHROPIC_API_KEY` - Required for AI analysis
- `PUPPETEER_EXECUTABLE_PATH` - Optional, path to chromium

## Running the Application
The application runs on port 5000 with `npm run dev`

## Recent Changes
- Implemented complete proposal editor with all section types
- Added Kayi Digital-inspired design system
- Integrated Claude claude-sonnet-4-20250514 for AI analysis
- Set up Puppeteer with system Chromium for PDF generation
