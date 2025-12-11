# 🔒 Security Checklist - Pre-Deployment

Use this checklist before deploying or publishing your application to ensure your API key remains secure.

## ✅ Local Development Checklist

- [ ] `.env` file exists in project root
- [ ] `.env` contains `VITE_GEMINI_API_KEY=your-actual-key`
- [ ] `.env` is listed in `.gitignore`
- [ ] No hardcoded API keys in source code
- [ ] Application runs successfully with `npm run dev`
- [ ] Test case generation works correctly

## ✅ Git Repository Checklist

Run these commands to verify:

### 1. Check if .env is gitignored
```bash
git status --ignored
```
**Expected:** `.env` appears in the ignored files list

### 2. Search for hardcoded API keys
```bash
git grep -i "AIza" -- "*.js" "*.jsx" "*.ts" "*.tsx" "*.html"
```
**Expected:** No results (command returns nothing)

### 3. Verify .env is not tracked
```bash
git ls-files | findstr .env
```
**Expected:** Only `.env.example` should appear (not `.env`)

### 4. Check .gitignore contents
```bash
type .gitignore | findstr .env
```
**Expected:** Should show `.env` is listed

## ✅ GitHub Pages Deployment Checklist

### Before First Deployment

- [ ] GitHub Secret `VITE_GEMINI_API_KEY` is created
- [ ] Secret value matches your API key
- [ ] `.github/workflows/deploy.yml` references the secret correctly
- [ ] Workflow has correct environment variable injection

### Verify GitHub Secret Setup

1. Go to: `https://github.com/YOUR_USERNAME/YOUR_REPO/settings/secrets/actions`
2. Confirm `VITE_GEMINI_API_KEY` exists
3. Value should be: `AIzaSyBkKOD2o7M8sLwyQfoOWp5R6lY618iZCbo`

### After Deployment

- [ ] GitHub Actions workflow completed successfully
- [ ] No API key visible in workflow logs
- [ ] Deployed site loads without errors
- [ ] Test case generation works on live site
- [ ] No API key visible in browser DevTools → Sources

## ✅ Code Review Checklist

Before committing any code changes:

- [ ] No `console.log()` statements printing API keys
- [ ] No API keys in comments
- [ ] Only `import.meta.env.VITE_GEMINI_API_KEY` is used
- [ ] No placeholder keys like `"YOUR_API_KEY_HERE"` in source
- [ ] No API keys in error messages

## ✅ Security Audit Checklist

### Monthly Review

- [ ] Check Google Cloud Console for unusual API usage
- [ ] Review billing and quota usage
- [ ] Verify API key restrictions are in place
- [ ] Confirm no unauthorized access

### After Key Rotation

- [ ] Old key revoked in Google Cloud Console
- [ ] New key updated in `.env`
- [ ] New key updated in GitHub Secrets
- [ ] Application tested with new key locally
- [ ] Deployment tested with new key
- [ ] Old key no longer works

## 🚨 Emergency Response

### If API Key is Exposed

1. **Immediate Actions:**
   - [ ] Go to Google Cloud Console
   - [ ] Revoke/delete the exposed key immediately
   - [ ] Generate a new API key
   - [ ] Update `.env` with new key
   - [ ] Update GitHub Secret with new key

2. **Investigation:**
   - [ ] Check Google Cloud usage for unauthorized activity
   - [ ] Review recent commits for how key was exposed
   - [ ] Identify all locations where key was published

3. **Prevention:**
   - [ ] Run through this entire checklist
   - [ ] Add additional git hooks if needed
   - [ ] Document the incident and lessons learned

## 📋 Quick Command Reference

### Windows (PowerShell)

```powershell
# Check git status with ignored files
git status --ignored

# Search for API keys in code
git grep -i "AIza" -- "*.js" "*.jsx" "*.ts" "*.tsx" "*.html"

# List tracked files
git ls-files

# View .gitignore
type .gitignore
```

### Verify Environment Variable Loading

```powershell
# Start dev server
npm run dev

# In browser console, check (should be undefined in production)
# DO NOT log the actual key value
console.log(typeof import.meta.env.VITE_GEMINI_API_KEY)
```

## ✅ Final Pre-Commit Checklist

Before running `git commit`:

1. [ ] Reviewed all changed files
2. [ ] No `.env` file in staged changes
3. [ ] No API keys in staged changes
4. [ ] Ran security audit commands above
5. [ ] All tests pass locally

## ✅ Final Pre-Push Checklist

Before running `git push`:

1. [ ] All commits reviewed
2. [ ] No sensitive data in commit history
3. [ ] `.env` is gitignored
4. [ ] GitHub Secret is configured (for deployments)
5. [ ] Ready to trigger deployment

---

**Remember:** It only takes one mistake to expose your API key. Use this checklist every time! 🔐
