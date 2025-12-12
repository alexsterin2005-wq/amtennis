# Google Sheets API Troubleshooting Guide

## Common Deployment Issues

### 1. Check Browser Console

Open your deployed site and press **F12** (or right-click → Inspect → Console tab). Look for error messages like:

- `"Google API library not loaded"`
- `"API initialization failed"`
- `"Access blocked"`
- `"Invalid API key"`

### 2. API Key Issues

**Problem:** API key not working on deployed site

**Solutions:**

#### Option A: Check API Key Restrictions
1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Click on your API key
3. Under "Application restrictions":
   - Select **"HTTP referrers (web sites)"**
   - Add these referrers:
     ```
     https://your-site.netlify.app/*
     http://localhost/*
     ```
   - Replace `your-site.netlify.app` with your actual Netlify domain
4. Click **Save**
5. Wait 5 minutes for changes to propagate

#### Option B: Use Unrestricted Key (Less Secure)
1. In Google Cloud Console, edit your API key
2. Under "Application restrictions", select **"None"**
3. Under "API restrictions", ensure "Google Sheets API" is selected
4. Save and wait 5 minutes

### 3. Sheet Permission Issues

**Problem:** "Permission denied" or "The caller does not have permission"

**Solution:**
1. Open your Google Sheet
2. Click **Share** button
3. Change to **"Anyone with the link"**
4. Set permission to **"Editor"** (not Viewer)
5. Click Done

### 4. Sheet Not Found Error

**Problem:** "Unable to parse range" or "Requested entity was not found"

**Solution:**
1. Verify your Spreadsheet ID in the code matches your sheet URL
2. Check the sheet tab name is exactly **"Bookings"** (case-sensitive)
3. Make sure row 1 has the header columns as specified

### 5. CORS or Loading Issues

**Problem:** Google API script not loading

**Solution:**
Check that this line is in your HTML `<head>`:
```html
<script src="https://apis.google.com/js/api.js"></script>
```

### 6. Netlify Environment Variables (Optional Better Approach)

Instead of hardcoding credentials, you can use Netlify environment variables:

1. Go to your Netlify site dashboard
2. Navigate to **Site settings** → **Environment variables**
3. Add these variables:
   - `GOOGLE_SHEETS_API_KEY` = your API key
   - `GOOGLE_SHEETS_SPREADSHEET_ID` = your spreadsheet ID

4. Update your code to use these (requires build process):
```javascript
const GOOGLE_CONFIG = {
  API_KEY: process.env.GOOGLE_SHEETS_API_KEY || 'fallback_key',
  SPREADSHEET_ID: process.env.GOOGLE_SHEETS_SPREADSHEET_ID || 'fallback_id',
  SHEET_NAME: 'Bookings'
};
```

Note: For static HTML, this requires a build step with something like Netlify Functions.

## Quick Test Checklist

✅ **API Key is correct** - Copy-pasted from Google Cloud Console  
✅ **Spreadsheet ID is correct** - From the URL between `/d/` and `/edit`  
✅ **Google Sheets API is enabled** - In Google Cloud Console  
✅ **API key restrictions allow your domain** - Both HTTP referrers include Netlify URL  
✅ **Sheet is publicly accessible** - "Anyone with the link" + "Editor" permission  
✅ **Sheet name is "Bookings"** - Exact match, case-sensitive  
✅ **Row 1 has headers** - 12 columns as specified in setup guide  
✅ **Browser console shows no errors** - Press F12 to check  

## Testing Steps

### Test 1: Verify API Key Works
Open browser console and run:
```javascript
fetch('https://sheets.googleapis.com/v4/spreadsheets/YOUR_SPREADSHEET_ID/values/Bookings!A1:A1?key=YOUR_API_KEY')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)
```

Replace `YOUR_SPREADSHEET_ID` and `YOUR_API_KEY` with your actual values.

**Expected:** Should return data or empty result (not error)

### Test 2: Check Sheet Access
Visit this URL in your browser:
```
https://docs.google.com/spreadsheets/d/YOUR_SPREADSHEET_ID/edit
```

**Expected:** Should open your sheet (even if you're not logged in to the owner account)

### Test 3: Test Locally First
1. Open `index.html` directly in your browser (file://)
2. Try making a booking
3. Check browser console for errors
4. Verify booking appears in Google Sheet

If it works locally but not on Netlify, the issue is likely API key restrictions.

## Still Not Working?

### Error: "Failed to initialize Google Sheets: API initialization failed"

**Likely causes:**
- Google API script blocked by ad blocker
- Slow internet connection (timeout)
- Google API service is down (rare)

**Try:**
- Disable ad blockers
- Test on different network/browser
- Check [Google Workspace Status](https://www.google.com/appsstatus/dashboard/)

### Error: "Invalid API key"

**Solution:**
- Generate a new API key in Google Cloud Console
- Make sure you're copying the correct key (not Client ID or other credential)
- Delete old key and create fresh one

### Error: "Access blocked: This API key is not valid"

**Solution:**
- Check API key restrictions match your deployment URL exactly
- Remove all restrictions temporarily to test
- Ensure API key hasn't expired or been deleted

## Alternative: Use Netlify Functions

If API key restrictions keep causing issues, consider using a Netlify Function as a proxy:

1. Create `netlify/functions/sheets.js`
2. Move API key to Netlify environment variables (server-side)
3. Function calls Google Sheets API on behalf of client
4. Update client code to call your function instead of Google API directly

This is more secure and avoids CORS/restriction issues.

Need help implementing this? Let me know!

## Contact

If you're still stuck, provide:
1. The exact error message from browser console
2. Your Netlify site URL
3. Whether it works locally (file://) or not

This will help diagnose the specific issue.
