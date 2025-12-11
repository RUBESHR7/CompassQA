# 🔒 Google API Key Security Guide

## Why API Key Security Matters

API keys are like passwords to your Google Cloud services. If exposed publicly, malicious users can:
- Consume your API quota
- Incur unexpected charges
- Access your services without authorization
- Potentially compromise your application

## ✅ Correct Implementation (Current Setup)

### Local Development

**1. Environment Variable File (`.env`)**

Your project uses a `.env` file that is **gitignored** (never committed to GitHub):

```env
VITE_GEMINI_API_KEY=AIzaSyBkKOD2o7M8sLwyQfoOWp5R6lY618iZCbo
```

**2. Code References Environment Variable**

In `src/utils/aiService.js`:
```javascript
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
```

This loads the key from the environment at build time, not hardcoded in source.

### Production Deployment (GitHub Pages)

**GitHub Actions Workflow** injects the API key during build:

```yaml
- name: Build
  run: npm run build
  env:
    VITE_GEMINI_API_KEY: ${{ secrets.VITE_GEMINI_API_KEY }}
```

The secret `VITE_GEMINI_API_KEY` is stored securely in GitHub repository settings.

## ❌ What NOT to Do

### Never Hardcode API Keys

**WRONG:**
```javascript
// ❌ NEVER DO THIS
const apiKey = "AIzaSyBkKOD2o7M8sLwyQfoOWp5R6lY618iZCbo";
```

**WRONG:**
```html
<!-- ❌ NEVER DO THIS -->
<script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyBk..."></script>
```

**WRONG:**
```javascript
// ❌ NEVER DO THIS
const GOOGLE_KEY = "YOUR_API_KEY_HERE"; // Even as placeholder
```

### Never Commit `.env` Files

The `.gitignore` file already includes:
```
.env
.env.test
.env.production
```

**Always verify** `.env` is gitignored before committing.

## 🔧 Setup Instructions

### First Time Setup

1. **Copy the example file:**
   ```bash
   copy .env.example .env
   ```

2. **Add your API key to `.env`:**
   ```env
   VITE_GEMINI_API_KEY=your-actual-api-key-here
   ```

3. **Verify it's gitignored:**
   ```bash
   git status --ignored
   ```
   You should see `.env` in the ignored files list.

4. **Start development:**
   ```bash
   npm run dev
   ```

### GitHub Pages Deployment Setup

1. **Go to your GitHub repository**
   - Navigate to: `Settings` → `Secrets and variables` → `Actions`

2. **Create/Update Secret**
   - Click `New repository secret` (or edit existing)
   - Name: `VITE_GEMINI_API_KEY`
   - Value: `AIzaSyBkKOD2o7M8sLwyQfoOWp5R6lY618iZCbo`
   - Click `Add secret`

3. **Trigger Deployment**
   - Push to `main` branch
   - GitHub Actions will automatically build and deploy
   - The secret will be injected during build (never exposed in logs)

## 🔄 API Key Rotation

When you need to rotate your API key:

### Step 1: Generate New Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to `APIs & Services` → `Credentials`
3. Create a new API key or regenerate existing one
4. Copy the new key

### Step 2: Update Local Environment
1. Open `.env` file
2. Replace the old key with the new one:
   ```env
   VITE_GEMINI_API_KEY=new-api-key-here
   ```
3. Restart your development server

### Step 3: Update GitHub Secret
1. Go to GitHub repository → `Settings` → `Secrets and variables` → `Actions`
2. Click on `VITE_GEMINI_API_KEY`
3. Click `Update secret`
4. Paste the new key
5. Save changes

### Step 4: Revoke Old Key
1. Return to Google Cloud Console
2. Delete or disable the old API key
3. This prevents unauthorized use of the old key

## 🛡️ Security Best Practices

### 1. API Key Restrictions (Recommended)

In Google Cloud Console, restrict your API key:

- **Application restrictions:**
  - HTTP referrers: Add your GitHub Pages domain
  - Example: `https://yourusername.github.io/*`

- **API restrictions:**
  - Restrict to only: `Generative Language API`

### 2. Monitor Usage

- Regularly check [Google Cloud Console](https://console.cloud.google.com/)
- Review API usage and quotas
- Set up billing alerts

### 3. Environment File Management

- **Never** commit `.env` files
- **Always** use `.env.example` as a template (without real keys)
- **Keep** `.env` in `.gitignore`

### 4. Code Review Checklist

Before committing code:
- [ ] No hardcoded API keys in source files
- [ ] `.env` is gitignored
- [ ] Only `import.meta.env.VITE_GEMINI_API_KEY` is used
- [ ] No API keys in comments or documentation

## 🐛 Troubleshooting

### "API Key is required" Error

**Local Development:**
1. Check if `.env` file exists in project root
2. Verify the key name is exactly: `VITE_GEMINI_API_KEY`
3. Restart the dev server (`npm run dev`)

**Production (GitHub Pages):**
1. Verify GitHub Secret is set correctly
2. Check the secret name matches: `VITE_GEMINI_API_KEY`
3. Trigger a new deployment (push to main)

### API Key Not Working

1. **Verify the key is valid:**
   - Check Google Cloud Console
   - Ensure the API is enabled
   - Check for any restrictions

2. **Check API restrictions:**
   - Ensure your domain is whitelisted
   - Verify API restrictions allow Generative Language API

3. **Check quota limits:**
   - Review usage in Google Cloud Console
   - Ensure you haven't exceeded free tier limits

### `.env` File Accidentally Committed

If you accidentally commit `.env`:

1. **Remove from repository:**
   ```bash
   git rm --cached .env
   git commit -m "Remove .env file"
   git push
   ```

2. **Rotate the API key immediately** (follow rotation steps above)

3. **Verify `.gitignore`:**
   ```bash
   echo .env >> .gitignore
   git add .gitignore
   git commit -m "Ensure .env is gitignored"
   ```

## 📚 Additional Resources

- [Google Cloud API Key Best Practices](https://cloud.google.com/docs/authentication/api-keys)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [GitHub Encrypted Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)

## 🎯 Quick Reference

| Environment | Where Key is Stored | How It's Used |
|-------------|-------------------|---------------|
| **Local Dev** | `.env` file (gitignored) | Loaded by Vite at runtime |
| **GitHub Pages** | GitHub Secrets | Injected during build by GitHub Actions |
| **Source Code** | `import.meta.env.VITE_GEMINI_API_KEY` | Reference only, never hardcoded |

---

**Remember:** Your API key is like a password. Treat it with the same level of security! 🔐
