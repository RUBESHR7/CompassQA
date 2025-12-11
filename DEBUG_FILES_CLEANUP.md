# ⚠️ Debug Files Cleanup Notice

## Security Alert

During the security audit, I found **20 debug/test files** in the project root directory that contain **hardcoded API keys**. These files appear to be development/debugging scripts.

### Files with Hardcoded Keys

All of these files contain the old API key `AIzaSyAom0ZV28TSNrfkigNE4Y3SLXx4QrB6QAA`:

1. `check-alternatives.js`
2. `check-key-3.js`
3. `check-key-4.js`
4. `check-models.js`
5. `check-new-key.js`
6. `check-quota.js`
7. `debug-app-flow.js`
8. `debug-experimental.js`
9. `debug-fallback.js`
10. `debug-gen.js`
11. `debug-models.js`
12. `debug-old-key.js`
13. `debug-v1.js`
14. `find-working-model.js`
15. `list-models-raw.js`
16. `list-models.js`
17. `quick-test.js`
18. `stress-test.js`
19. `test-api.js`
20. `test-rest.js`

## Recommended Actions

### Option 1: Delete Debug Files (Recommended)

If these files are no longer needed:

```bash
# Review the files first to ensure they're not needed
# Then delete them
Remove-Item check-*.js, debug-*.js, find-*.js, list-*.js, quick-test.js, stress-test.js, test-*.js
```

### Option 2: Update to Use Environment Variables

If you need to keep these files for testing, update them to use environment variables:

**Before:**
```javascript
const API_KEY = "AIzaSyAom0ZV28TSNrfkigNE4Y3SLXx4QrB6QAA";
```

**After:**
```javascript
import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.VITE_GEMINI_API_KEY;
if (!API_KEY) {
  throw new Error("API key not found. Please set VITE_GEMINI_API_KEY in .env file");
}
```

### Option 3: Move to a Debug Directory

Create a `debug/` or `scripts/` directory and move these files there, then add to `.gitignore`:

```bash
# Create debug directory
New-Item -ItemType Directory -Path debug

# Move files
Move-Item check-*.js, debug-*.js, find-*.js, list-*.js, quick-test.js, stress-test.js, test-*.js -Destination debug/

# Add to .gitignore
Add-Content .gitignore "`ndebug/"
```

## Important Notes

### Current Status

✅ **Good News:**
- The main application (`src/utils/aiService.js`) correctly uses environment variables
- `.env` file is properly gitignored
- New API key is securely stored in `.env`
- GitHub Actions workflow uses secrets correctly

⚠️ **Attention Needed:**
- Debug files contain old API key (already exposed in previous commits)
- These files are currently tracked by git
- If committed, they will expose the old key in git history

### Security Impact

**Low Risk** - The hardcoded key in these files is an **old key** (`AIzaSyAom0ZV28TSNrfkigNE4Y3SLXx4QrB6QAA`), not your new key.

However, if these files are committed to GitHub:
- The old key will be visible in the repository
- You should revoke the old key in Google Cloud Console

### Next Steps

1. **Decide what to do with debug files** (delete, update, or move)
2. **If keeping them:** Update to use environment variables
3. **If deleting them:** Run the cleanup command
4. **Revoke old API key** in Google Cloud Console (recommended)

## Quick Cleanup Script

I've created a PowerShell script to help you clean up:

```powershell
# cleanup-debug-files.ps1
# This script lists all debug files and asks for confirmation before deletion

$debugFiles = @(
    "check-alternatives.js", "check-key-3.js", "check-key-4.js",
    "check-models.js", "check-new-key.js", "check-quota.js",
    "debug-app-flow.js", "debug-experimental.js", "debug-fallback.js",
    "debug-gen.js", "debug-models.js", "debug-old-key.js", "debug-v1.js",
    "find-working-model.js", "list-models-raw.js", "list-models.js",
    "quick-test.js", "stress-test.js", "test-api.js", "test-rest.js"
)

Write-Host "The following debug files contain hardcoded API keys:" -ForegroundColor Yellow
$debugFiles | ForEach-Object { Write-Host "  - $_" }

$response = Read-Host "`nDo you want to DELETE these files? (yes/no)"
if ($response -eq "yes") {
    $debugFiles | ForEach-Object {
        if (Test-Path $_) {
            Remove-Item $_ -Force
            Write-Host "Deleted: $_" -ForegroundColor Green
        }
    }
    Write-Host "`nCleanup complete!" -ForegroundColor Green
} else {
    Write-Host "`nCleanup cancelled. Please handle these files manually." -ForegroundColor Yellow
}
```

## Summary

Your **main application is secure** ✅ - it uses environment variables correctly.

The debug files are **legacy development scripts** that need cleanup to maintain best practices.

**Recommendation:** Delete the debug files if they're no longer needed, or move them to a separate directory and update them to use environment variables.
