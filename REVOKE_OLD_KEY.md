# 🔄 API Key Revocation Guide

## Why Revoke the Old Key?

The old API key `AIzaSyAom0ZV28TSNrfkigNE4Y3SLXx4QrB6QAA` was found in debug files that may have been committed to git history. Revoking it prevents any potential unauthorized use.

## Step-by-Step Instructions

### 1. Access Google Cloud Console

Open your browser and navigate to:
```
https://console.cloud.google.com/
```

### 2. Navigate to API Credentials

1. Click on the **Navigation Menu** (☰ hamburger icon, top left)
2. Hover over **APIs & Services**
3. Click on **Credentials**

Alternatively, use this direct link:
```
https://console.cloud.google.com/apis/credentials
```

### 3. Locate the Old API Key

In the **API Keys** section, look for:
- Key ending in: `...6QAA`
- Full key: `AIzaSyAom0ZV28TSNrfkigNE4Y3SLXx4QrB6QAA`

You may see multiple keys. Look for:
- Creation date (older key)
- Last used date
- Key restrictions

### 4. Delete or Restrict the Key

**Option A: Delete the Key (Recommended)**

1. Click on the key name to open details
2. Click **DELETE** button (top of page)
3. Confirm deletion in the popup dialog
4. ✅ Key is permanently revoked

**Option B: Restrict the Key (Alternative)**

If you want to keep it for reference but disable it:

1. Click on the key name
2. Under **Application restrictions**, select:
   - **HTTP referrers (web sites)**
   - Add a non-existent domain: `https://example-disabled.com/*`
3. Under **API restrictions**, select:
   - **Restrict key**
   - Uncheck all APIs
4. Click **SAVE**
5. ✅ Key is effectively disabled

### 5. Verify Your New Key is Active

While in the Credentials page:

1. Verify your **new key** exists: `AIzaSyBkKOD2o7M8sLwyQfoOWp5R6lY618iZCbo`
2. Click on it to configure restrictions (recommended)

### 6. Configure New Key Restrictions (Recommended)

To secure your new key:

**Application Restrictions:**
1. Select **HTTP referrers (web sites)**
2. Add your GitHub Pages domain:
   ```
   https://YOUR_USERNAME.github.io/*
   ```
3. Add localhost for development:
   ```
   http://localhost:5173/*
   http://localhost:*
   ```

**API Restrictions:**
1. Select **Restrict key**
2. Check only: **Generative Language API**
3. Click **SAVE**

## Visual Guide

```
Google Cloud Console
    └── APIs & Services
        └── Credentials
            └── API Keys section
                ├── Old Key (AIza...6QAA) → DELETE
                └── New Key (AIza...Cbo) → CONFIGURE
                    ├── HTTP referrers
                    │   ├── https://YOUR_USERNAME.github.io/*
                    │   └── http://localhost:*
                    └── API restrictions
                        └── Generative Language API
```

## Verification

After revoking the old key:

1. **Test your application locally:**
   ```bash
   npm run dev
   ```
   Should work with new key ✅

2. **Old key should fail:**
   If you try to use the old key, you should get an error:
   ```
   API key not valid. Please pass a valid API key.
   ```

## Troubleshooting

### Can't Find the Old Key?

- It may have already been deleted
- Check if you have multiple Google Cloud projects
- Look in the project dropdown (top of page)

### New Key Not Working?

1. Verify the key is enabled
2. Check API restrictions allow Generative Language API
3. Verify HTTP referrer restrictions include your domain
4. Wait 1-2 minutes for changes to propagate

### Accidentally Deleted New Key?

1. Update `.env` with a newly generated key
2. Update GitHub Secret with the new key
3. Update any other places where the key is stored

## Security Best Practices

After revocation:

✅ **Do:** Regularly review your API keys in Cloud Console  
✅ **Do:** Set up billing alerts to monitor usage  
✅ **Do:** Use API restrictions to limit key usage  
✅ **Do:** Rotate keys periodically (every 90 days)  

❌ **Don't:** Share API keys in public repositories  
❌ **Don't:** Use the same key across multiple projects  
❌ **Don't:** Disable all restrictions (leaves key vulnerable)  

## Summary Checklist

- [ ] Accessed Google Cloud Console
- [ ] Navigated to APIs & Services → Credentials
- [ ] Located old key: `AIzaSyAom0ZV28TSNrfkigNE4Y3SLXx4QrB6QAA`
- [ ] Deleted or restricted the old key
- [ ] Verified new key is active: `AIzaSyBkKOD2o7M8sLwyQfoOWp5R6lY618iZCbo`
- [ ] Configured restrictions on new key (optional but recommended)
- [ ] Tested application with new key

---

**Need help?** Check the [Google Cloud API Keys documentation](https://cloud.google.com/docs/authentication/api-keys)
