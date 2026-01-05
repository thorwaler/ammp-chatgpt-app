# AMMP ChatGPT App - Deployment Guide

## 📦 Deployment Options

### Option 1: Vercel (Recommended)

Vercel provides the easiest deployment path with zero-config Next.js support.

#### Prerequisites
- GitHub account
- Vercel account (sign up at https://vercel.com)
- Git repository with your code

#### Steps

1. **Push code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/ammp-chatgpt-app.git
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Vercel auto-detects Next.js configuration
   - Click "Deploy"

3. **Configure Environment Variables** (in Vercel dashboard)
   ```
   AMMP_BASE_URL=https://data-api.ammp.io
   ```

4. **Get your MCP endpoint**
   - After deployment, your MCP endpoint will be:
   - `https://YOUR_PROJECT.vercel.app/api/mcp`

5. **Add to ChatGPT**
   - Enable developer mode in ChatGPT
   - Settings → Connectors → Create
   - Use: `https://YOUR_PROJECT.vercel.app/api/mcp`
   - Name: "AMMP Energy Monitor"

#### Vercel CLI Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

---

### Option 2: Railway

Railway provides simple deployment with automatic SSL.

#### Steps

1. **Install Railway CLI**
   ```bash
   npm i -g @railway/cli
   ```

2. **Login and initialize**
   ```bash
   railway login
   railway init
   ```

3. **Deploy**
   ```bash
   railway up
   ```

4. **Set environment variables**
   ```bash
   railway variables set AMMP_BASE_URL=https://data-api.ammp.io
   ```

5. **Get your domain**
   ```bash
   railway domain
   ```

---

### Option 3: Local Development with ngrok

For testing and development, use ngrok to expose your local server.

#### Steps

1. **Install ngrok**
   - Download from https://ngrok.com/download
   - Or: `brew install ngrok` (Mac)

2. **Start local server**
   ```bash
   npm run dev:local
   ```

3. **Expose with ngrok**
   ```bash
   ngrok http 3000
   ```

4. **Use ngrok URL in ChatGPT**
   - `https://YOUR_SUBDOMAIN.ngrok.app/mcp`
   - Note: ngrok URLs change on restart (use paid plan for static URLs)

---

### Option 4: Docker

Deploy using Docker containers for maximum flexibility.

#### Dockerfile

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build && npm run build:widget

EXPOSE 3000

CMD ["npm", "start"]
```

#### Build and Run

```bash
# Build image
docker build -t ammp-chatgpt-app .

# Run container
docker run -p 3000:3000 \
  -e AMMP_BASE_URL=https://data-api.ammp.io \
  ammp-chatgpt-app
```

#### Deploy to cloud providers
- **AWS ECS/Fargate**
- **Google Cloud Run**
- **Azure Container Instances**
- **DigitalOcean App Platform**

---

## 🔧 Configuration

### Environment Variables

Create `.env.local` (ignored by git):
```bash
AMMP_BASE_URL=https://data-api.ammp.io
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### Custom Domain

#### Vercel
1. Go to project settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. SSL certificates are automatic

#### Railway
```bash
railway domain add your-domain.com
```

---

## 🧪 Testing Deployment

### Health Check

```bash
# Test MCP endpoint
curl https://your-domain.com/api/mcp

# Expected response
{"name":"ammp-chatgpt-app","version":"1.0.0","status":"ok"}
```

### Test in ChatGPT

1. Enable developer mode
2. Add connector with your production URL
3. Test with:
   ```
   "Authenticate with my AMMP API key: [test-key]"
   ```

---

## 📊 Monitoring

### Vercel Analytics

Enable in `vercel.json`:
```json
{
  "analytics": {
    "enable": true
  }
}
```

### Logging

View logs:
```bash
# Vercel
vercel logs YOUR_PROJECT

# Railway
railway logs
```

---

## 🔒 Security Best Practices

1. **CORS Configuration**
   - Only allow ChatGPT domains in production
   - Update `next.config.js` headers

2. **Rate Limiting**
   - Implement rate limiting on MCP endpoint
   - Use Vercel Edge Functions for protection

3. **Environment Variables**
   - Never commit `.env.local`
   - Use platform-specific secret management

4. **API Key Security**
   - API keys are encrypted in transit
   - Never log API keys
   - Tokens auto-refresh

---

## 🚀 Performance Optimization

### Next.js Optimizations

1. **Enable SWC minification** (enabled by default)
2. **Image optimization** - Use Next.js Image component
3. **Static Generation** - Pre-render widget HTML

### Widget Optimization

```bash
# Analyze bundle size
npm run build:widget

# Check output size
ls -lh public/widget.html
```

Target: < 100KB for widget.html

---

## 🔄 CI/CD

### GitHub Actions

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm run build
      - run: npm run build:widget
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

---

## 📝 Updating the App

### Deploy Updates

```bash
# Commit changes
git add .
git commit -m "Update: description"
git push

# Vercel auto-deploys on push
# Or manual deploy:
vercel --prod
```

### Update Widget Only

```bash
npm run build:widget
vercel --prod
```

---

## ❓ Troubleshooting

### Issue: MCP endpoint returns 404
- Check `app/api/mcp/route.ts` exists
- Verify deployment logs
- Confirm URL path is `/api/mcp`

### Issue: CORS errors in ChatGPT
- Check `next.config.js` headers
- Verify `Access-Control-Allow-Origin: *`
- Check browser console for specific error

### Issue: Widget not rendering
- Verify `public/widget.html` was built
- Check `npm run build:widget` output
- Confirm CSP headers allow resources

### Issue: Authentication fails
- Verify `AMMP_BASE_URL` environment variable
- Check API client bearer token logic
- Test AMMP API directly: `curl https://data-api.ammp.io`

---

## 📞 Support

For deployment issues:
1. Check Vercel/Railway logs
2. Review browser console errors
3. Test MCP endpoint directly with curl
4. Verify environment variables are set

---

## 🎯 Quick Deploy Commands

```bash
# Vercel (recommended)
npm i -g vercel && vercel --prod

# Railway
npm i -g @railway/cli && railway up

# Local with ngrok
npm run dev:local && ngrok http 3000

# Docker
docker build -t ammp-app . && docker run -p 3000:3000 ammp-app
```

---

Your AMMP ChatGPT App is now ready for production! 🚀
