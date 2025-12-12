# Google Sheets API Setup Instructions

Your booking system now saves data to Google Sheets, organized by coach with all lesson details (date, time, client info).

## Step 1: Create a Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Name it **"AM Tennis Bookings"**
4. In the first sheet tab, rename it to **"Bookings"**
5. Add these column headers in row 1:
   - A1: `Booking ID`
   - B1: `Coach`
   - C1: `Date`
   - D1: `Time`
   - E1: `Duration (min)`
   - F1: `Price`
   - G1: `Client Name`
   - H1: `Email`
   - I1: `Phone`
   - J1: `Notes`
   - K1: `Status`
   - L1: `Created At`

6. Copy the **Spreadsheet ID** from the URL:
   - URL looks like: `https://docs.google.com/spreadsheets/d/1ABC123xyz456/edit`
   - Copy the part: `1ABC123xyz456`

## Step 2: Get Google Sheets API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google Sheets API:
   - Click "Enable APIs and Services"
   - Search for "Google Sheets API"
   - Click "Enable"
4. Create API credentials:
   - Go to "Credentials" in left menu
   - Click "Create Credentials" → "API Key"
   - Copy your API key
   - Click "Edit API key" to restrict it:
     - Under "API restrictions", select "Restrict key"
     - Choose "Google Sheets API"
     - Under "Website restrictions", add your Netlify domain (e.g., `https://your-site.netlify.app/*`)
     - Save

## Step 3: Make Sheet Public (Read/Write)

1. In your Google Sheet, click the **Share** button
2. Under "General access", change to **"Anyone with the link"**
3. Set permission to **"Editor"** (allows the API to write data)
4. Copy the share link (optional, for your records)

## Step 4: Update Your Code

Open `index.html` and find this section (around line 20):

```javascript
const GOOGLE_CONFIG = {
  API_KEY: 'YOUR_API_KEY_HERE',  // Paste your API key here
  SPREADSHEET_ID: 'YOUR_SPREADSHEET_ID_HERE',  // Paste your spreadsheet ID here
  SHEET_NAME: 'Bookings'  // Leave as is (or change if you named the tab differently)
};
```

Replace:
- `YOUR_API_KEY_HERE` with your actual API key
- `YOUR_SPREADSHEET_ID_HERE` with your spreadsheet ID

## Step 5: Test Locally

1. Open `index.html` in a browser
2. Try making a test booking
3. Check your Google Sheet - the booking should appear as a new row

## Step 6: Deploy to Netlify

1. Commit and push your changes to your repository
2. Netlify will automatically deploy
3. Update your API key restrictions in Google Cloud Console to include your Netlify domain

## How Data is Organized

Your bookings are stored in a single sheet with each row representing one booking:

**Example:**
| Booking ID | Coach | Date | Time | Duration | Price | Client Name | Email | Phone | Notes | Status | Created At |
|------------|-------|------|------|----------|-------|-------------|-------|-------|-------|--------|------------|
| booking:... | Alex | 2025-12-15 | 10:00 AM | 60 | 65.00 | John Doe | john@example.com | 555-1234 | Beginner | confirmed | 2025-12-11... |
| booking:... | Aaron | 2025-12-16 | 2:00 PM | 90 | 97.50 | Jane Smith | jane@example.com | 555-5678 | Advanced | confirmed | 2025-12-11... |

### Filtering by Coach

You can easily filter/sort in Google Sheets:
- Click the filter button in the header row
- Filter by "Coach" column to see lessons for Alex, Aaron, or Mikkel
- Sort by date/time to see upcoming lessons
- Use pivot tables to analyze bookings per coach

### Using the Data

- **View all bookings**: Open the Google Sheet
- **Export to Excel**: File → Download → Excel (.xlsx)
- **Create reports**: Use Google Sheets formulas, pivot tables, or charts
- **Share with coaches**: Share specific filtered views with each coach

## Troubleshooting

**Error: "Failed to save booking to Google Sheets"**
- Check that your API key and Spreadsheet ID are correct
- Verify the sheet is shared as "Anyone with the link" with "Editor" permissions
- Check browser console for specific error messages

**Bookings not appearing**
- Refresh the Google Sheet
- Check that the sheet name matches (case-sensitive)
- Verify the API is enabled in Google Cloud Console

**API quota exceeded**
- Google Sheets API free tier: 100 requests/100 seconds/user
- This should be more than enough for a tennis booking system
- If needed, upgrade to a paid plan

## Security Note

⚠️ The sheet is publicly editable. For production:
1. Consider using OAuth 2.0 authentication instead of API key
2. Or use a backend service (Netlify Functions) to proxy requests
3. Monitor your sheet for unauthorized changes

## Need Help?

- [Google Sheets API Documentation](https://developers.google.com/sheets/api)
- Check browser console for error messages
- Verify all configuration values are correct
