# 🔐 GitHub Secret Setup Guide

## Step-by-Step Instructions

Follow these steps to add your API key as a GitHub Secret for deployment:

### 1. Navigate to Your Repository

Open your browser and go to your GitHub repository:
```
https://github.com/YOUR_USERNAME/YOUR_REPO_NAME
```

### 2. Access Repository Settings

1. Click on **Settings** tab (top right of repository page)
2. In the left sidebar, scroll down to **Security** section
3. Click on **Secrets and variables**
4. Click on **Actions**

### 3. Create New Secret

1. Click the **New repository secret** button (green button, top right)
2. Fill in the form:
   - **Name:** `VITE_GEMINI_API_KEY`
   - **Secret:** `AIzaSyBkKOD2o7M8sLwyQfoOWp5R6lY618iZCbo`
3. Click **Add secret** button

### 4. Verify Secret is Added

You should see `VITE_GEMINI_API_KEY` in your list of secrets with:
- A green checkmark
- The date it was created
- Note: The value will be hidden (shown as `***`)

### 5. Trigger Deployment

Once the secret is added, deployment will work automatically:

**Option A: Push to main branch**
```bash
git add .
git commit -m "Add security documentation and cleanup"
git push origin main
```

**Option B: Manually trigger workflow**
1. Go to **Actions** tab in your repository
2. Click on **Deploy to GitHub Pages** workflow
3. Click **Run workflow** button
4. Select `main` branch
5. Click **Run workflow**

### 6. Verify Deployment

1. Go to **Actions** tab
2. Watch the deployment workflow run
3. Once complete (green checkmark), your site will be live
4. Visit your GitHub Pages URL to test

## Troubleshooting

### Secret Not Working?

**Check the name exactly matches:**
- Must be: `VITE_GEMINI_API_KEY`
- Case-sensitive
- No extra spaces

**Verify the workflow file:**
- File: `.github/workflows/deploy.yml`
- Should have: `VITE_GEMINI_API_KEY: ${{ secrets.VITE_GEMINI_API_KEY }}`

### Deployment Fails?

1. Check **Actions** tab for error messages
2. Verify the secret name matches exactly
3. Try re-creating the secret
4. Check workflow logs for details

## Visual Guide

```
GitHub Repository
    └── Settings
        └── Security
            └── Secrets and variables
                └── Actions
                    └── New repository secret
                        ├── Name: VITE_GEMINI_API_KEY
                        └── Secret: AIzaSyBkKOD2o7M8sLwyQfoOWp5R6lY618iZCbo
```

## Security Notes

✅ **Safe:** GitHub Secrets are encrypted and never exposed in logs  
✅ **Safe:** Only workflows can access secrets  
✅ **Safe:** Secret values are hidden in the UI  
❌ **Never:** Share your secret value publicly  
❌ **Never:** Commit secrets to your repository  

## Next Steps

After adding the secret:
1. ✅ Push your code changes to trigger deployment
2. ✅ Monitor the Actions tab for deployment status
3. ✅ Test your live site once deployed

---

**Need help?** Check the [GitHub Secrets documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
