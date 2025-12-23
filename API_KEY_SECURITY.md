# 🔒 API Key Security Guide

## Why API Key Security Matters

API keys are like passwords to your Cloud services. If exposed publicly, malicious users can:
- Consume your API quota
- Incur unexpected charges
- Access your services without authorization
- Potentially compromise your application

## ✅ Correct Implementation (Current Setup)

### Local Development

**1. Environment Variable File (`.env`)**

Your project uses a `.env` file that is **gitignored** (never committed to GitHub):

```env
VITE_MISTRAL_API_KEY=your_mistral_key_here
```

**2. Code References Environment Variable**

In `src/utils/aiService.js`:
```javascript
const apiKey = import.meta.env.VITE_MISTRAL_API_KEY;
```

This loads the key from the environment at build time, not hardcoded in source.

### Production Deployment (GitHub Pages)

**GitHub Actions Workflow** injects the API key during build:

```yaml
- name: Build
  run: npm run build
  env:
    VITE_MISTRAL_API_KEY: ${{ secrets.VITE_MISTRAL_API_KEY }}
```

The secret `VITE_MISTRAL_API_KEY` is stored securely in GitHub repository settings.

## ❌ What NOT to Do

### Never Hardcode API Keys

**WRONG:**
```javascript
// ❌ NEVER DO THIS
const apiKey = "your_actual_key_here";
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
   VITE_MISTRAL_API_KEY=your-actual-api-key-here
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
   - Name: `VITE_MISTRAL_API_KEY`
   - Value: `your_mistral_api_key_here`
   - Click `Add secret`

3. **Trigger Deployment**
   - Push to `main` branch
   - GitHub Actions will automatically build and deploy
   - The secret will be injected during build (never exposed in logs)

## 🛡️ Security Best Practices

### 1. Environment File Management

- **Never** commit `.env` files
- **Always** use `.env.example` as a template (without real keys)
- **Keep** `.env` in `.gitignore`

### 2. Code Review Checklist

Before committing code:
- [ ] No hardcoded API keys in source files
- [ ] `.env` is gitignored
- [ ] Only `import.meta.env.VITE_MISTRAL_API_KEY` is used

## 🐛 Troubleshooting

### "API Key is required" Error

**Local Development:**
1. Check if `.env` file exists in project root
2. Verify the key name is exactly: `VITE_MISTRAL_API_KEY`
3. Restart the dev server (`npm run dev`)

**Production (GitHub Pages):**
1. Verify GitHub Secret is set correctly
2. Check the secret name matches: `VITE_MISTRAL_API_KEY`
3. Trigger a new deployment (push to main)
