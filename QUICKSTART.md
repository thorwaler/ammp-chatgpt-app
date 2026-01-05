# AMMP ChatGPT App - Quick Start Guide

Get your AMMP Energy Monitor running in **5 minutes**! ⚡

## 🚀 Fastest Path (Vercel)

### 1. Install Dependencies
```bash
npm install
```

### 2. Build the Widget
```bash
npm run build:widget
```

### 3. Deploy to Vercel
```bash
# Install Vercel CLI (one-time)
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

**✅ Done!** Your app is live at: `https://your-app.vercel.app`

### 4. Add to ChatGPT

1. Open ChatGPT
2. Enable **developer mode** in settings
3. Go to **Settings → Connectors → Create**
4. Enter your MCP endpoint:
   ```
   https://your-app.vercel.app/api/mcp
   ```
5. Name it: **"AMMP Energy Monitor"**
6. Click **Save**

### 5. Test It!

In ChatGPT, type:
```
Authenticate with my AMMP API key: [your-api-key-here]
```

Then try:
```
Show me all error alerts
What's today's energy production?
Show portfolio performance this week
```

---

## 🧪 Local Testing (ngrok)

### 1. Start Local Server
```bash
npm run dev:local
```

### 2. Expose with ngrok
```bash
ngrok http 3000
```

### 3. Use ngrok URL in ChatGPT
```
https://abc123.ngrok.app/mcp
```

**Note:** ngrok URLs change on restart. Use Vercel for persistent URLs.

---

## 📝 Get Your AMMP API Key

1. Go to: [https://data-api.ammp.io](https://data-api.ammp.io)
2. Sign in with your AMMP account
3. Navigate to API settings
4. Generate or copy your API key

---

## ❓ Troubleshooting

### "npm install" fails
```bash
# Try with legacy peer deps
npm install --legacy-peer-deps
```

### "vercel --prod" asks for login
```bash
# Make sure you're logged in
vercel login
```

### ChatGPT can't connect to MCP endpoint
- Check your URL includes `/api/mcp`
- Verify deployment succeeded: `vercel ls`
- Test endpoint: `curl https://your-app.vercel.app/api/mcp`
  - Should return: `{"name":"ammp-chatgpt-app",...}`

### Authentication fails in ChatGPT
- Verify your AMMP API key is correct
- Check AMMP API is accessible: `curl https://data-api.ammp.io`
- Review Vercel logs: `vercel logs your-app`

---

## 📚 Need More Details?

- **Full Deployment Guide:** See [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Component Docs:** See [PHASE-3-COMPLETE.md](./PHASE-3-COMPLETE.md)
- **Tool Docs:** See [PHASE-2-COMPLETE.md](./PHASE-2-COMPLETE.md)

---

## 🎯 Common Commands

```bash
# Development
npm run dev:local          # Local MCP server
npm run dev                # Next.js dev server

# Building
npm run build:widget       # Build React widget
npm run build              # Build Next.js app

# Deployment
npm run deploy             # Deploy to Vercel (prod)
npm run deploy:preview     # Deploy to Vercel (preview)

# Type checking
npm run type-check         # Check TypeScript
```

---

**That's it! You're ready to monitor your solar energy systems in ChatGPT! ☀️**
