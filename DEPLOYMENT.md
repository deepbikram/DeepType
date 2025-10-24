# 🚀 DeepType Deployment Guide

## Quick Start: Deploy to Netlify in 3 Steps

### Step 1: Prepare Your Code
```bash
# Make sure everything works locally
npm start

# Test production build
npm run build
```

### Step 2: Push to GitHub
```bash
# Initialize git if you haven't already
git init
git add .
git commit -m "Initial commit - DeepType ready for deployment"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR-USERNAME/deeptype.git
git branch -M main
git push -u origin main
```

### Step 3: Deploy on Netlify
1. Go to https://app.netlify.com
2. Sign up/login with GitHub
3. Click **"Add new site"** → **"Import an existing project"**
4. Choose **GitHub** and select your `deeptype` repository
5. Netlify will detect the `netlify.toml` configuration
6. Click **"Deploy site"**
7. ✨ Your site is live! (e.g., `https://deeptype-abc123.netlify.app`)

### Step 4 (Optional): Custom Domain
1. Go to **Site settings** → **Domain management**
2. Click **"Add custom domain"**
3. Follow the DNS configuration instructions
4. Your site will be live at your custom domain with free SSL!

---

## Alternative Deployment Methods

### Method 1: Netlify CLI (For Advanced Users)

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy to production
netlify deploy --prod

# Follow the prompts:
# - Create & configure a new site? Yes
# - Build command: npm run build
# - Publish directory: build
```

### Method 2: Netlify Drop (No Git Required)

Perfect for quick testing:

```bash
# Build the production version
npm run build

# Go to https://app.netlify.com/drop
# Drag and drop the 'build' folder
# Done! You get a temporary URL to test
```

---

## What Gets Deployed?

The `netlify.toml` configuration handles:

✅ **Automatic Build**: Runs `npm run build` on every deploy
✅ **SPA Routing**: All routes redirect to `index.html` for React Router
✅ **Asset Caching**: Static files cached for 1 year
✅ **Compression**: Brotli & Gzip enabled automatically
✅ **Security Headers**: XSS protection, frame options, etc.
✅ **Optimizations**: CSS/JS minification, image compression

---

## Continuous Deployment (Auto-Deploy on Git Push)

Once connected to GitHub:

```bash
# Make changes to your code
git add .
git commit -m "Add new feature"
git push

# Netlify automatically:
# 1. Detects the push
# 2. Runs npm install
# 3. Runs npm run build
# 4. Deploys to production
# 5. Sends you a notification
```

**Deploy time:** Usually 1-2 minutes ⚡

---

## Preview Deployments

When you create a Pull Request on GitHub:
- Netlify automatically creates a **preview deployment**
- You get a unique URL to test the changes
- Perfect for reviewing features before merging!

---

## Environment Variables (If Needed)

If you need to add API keys or secrets:

1. Go to **Site settings** → **Environment variables**
2. Add your variables (e.g., `REACT_APP_SPOTIFY_CLIENT_ID`)
3. Redeploy your site

**Important:** Variables must start with `REACT_APP_` to be available in React.

---

## Troubleshooting

### Build Fails
```bash
# Check build locally first
npm run build

# If it works locally but fails on Netlify:
# Check the build logs on Netlify dashboard
# Common issues:
# - Missing dependencies
# - Node version mismatch (change in netlify.toml)
# - Environment variables not set
```

### Blank Page After Deploy
```bash
# Clear browser cache
# Open DevTools Console (F12) to check for errors
# Common fixes:
# - Check if build/index.html exists
# - Verify netlify.toml redirect rules
# - Clear localStorage: localStorage.clear()
```

### 404 on Routes
The `netlify.toml` redirect rule should handle this. If not:
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

## Performance Monitoring

After deployment, test your site speed:
- https://pagespeed.web.dev
- https://www.webpagetest.org

Expected scores:
- **Performance:** 90-100
- **First Contentful Paint:** < 1.5s
- **Time to Interactive:** < 2.5s

---

## Rollback (If Something Goes Wrong)

1. Go to **Deploys** in Netlify dashboard
2. Find a previous successful deploy
3. Click **"Publish deploy"**
4. Instantly rolled back! ✨

---

## Cost

**Free Tier includes:**
- ✅ 100GB bandwidth/month
- ✅ 300 build minutes/month
- ✅ Unlimited sites
- ✅ SSL certificates
- ✅ Deploy previews
- ✅ Instant rollbacks

For a typing test app, you'll likely never exceed free tier limits!

---

## Need Help?

- 📚 Netlify Docs: https://docs.netlify.com
- 💬 Netlify Support: https://answers.netlify.com
- 🐛 DeepType Issues: GitHub Issues

---

**Happy Deploying! 🚀**
