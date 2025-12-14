# Deployment Guide - Vercel

## Prerequisites
- Vercel account (sign up at https://vercel.com)
- Git repository (GitHub, GitLab, or Bitbucket)
- Anthropic API key

## Environment Variables

Add these environment variables in Vercel Dashboard:

### Required:
- `ANTHROPIC_API_KEY` - Your Anthropic API key from https://console.anthropic.com/settings/keys
- `NODE_ENV` - Set to `production`

### Optional (for database features):
- `DATABASE_URL` - PostgreSQL connection string (if using user authentication)

## Deployment Steps

### Option 1: Deploy via Vercel CLI

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel
   ```

4. **Set Environment Variables:**
   ```bash
   vercel env add ANTHROPIC_API_KEY
   ```

5. **Deploy to Production:**
   ```bash
   vercel --prod
   ```

### Option 2: Deploy via Vercel Dashboard

1. **Push code to Git repository** (GitHub/GitLab/Bitbucket)

2. **Import project in Vercel:**
   - Go to https://vercel.com/new
   - Import your repository
   - Vercel will auto-detect the configuration

3. **Configure Environment Variables:**
   - In project settings → Environment Variables
   - Add `ANTHROPIC_API_KEY`
   - Add `NODE_ENV` = `production`

4. **Deploy:**
   - Click "Deploy"
   - Vercel will build and deploy automatically

## Post-Deployment

### Verify Deployment:
- Check frontend: `https://your-project.vercel.app`
- Test AI analysis: Upload requirements and generate proposal
- Test PDF generation: Create and download a proposal PDF

### Important Notes:

1. **Puppeteer/PDF Generation:**
   - Vercel has a 50MB deployment size limit
   - Puppeteer is configured to use system Chromium
   - PDF generation should work on Vercel's infrastructure

2. **Function Timeout:**
   - Free tier: 10 seconds
   - Pro tier: 60 seconds
   - AI analysis may take 15-20 seconds, consider upgrading if needed

3. **Cold Starts:**
   - First request after inactivity may be slower
   - Subsequent requests will be faster

## Troubleshooting

### If PDF generation fails:
- Upgrade to Pro plan for better limits
- Or consider using alternative PDF libraries

### If API requests timeout:
- Increase function timeout in vercel.json
- Optimize AI prompts to reduce response time

### If build fails:
- Check build logs in Vercel dashboard
- Ensure all dependencies are in package.json
- Verify Node.js version compatibility

## Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed

## Monitoring

- View logs in Vercel Dashboard → Deployments → Functions
- Monitor analytics in Vercel Dashboard

## Support

For issues, check:
- Vercel documentation: https://vercel.com/docs
- Vercel support: https://vercel.com/support
