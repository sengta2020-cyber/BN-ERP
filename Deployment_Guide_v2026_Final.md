# Deployment Guide: BN Asset Governance System v2026 (Final)

This guide provides step-by-step instructions to deploy the updated BN Asset Governance System, including the new Lao language localization, new asset fields (Serial, Vendor, Dates), and the "S/N" table column.

## 1. Prerequisites
- Access to your Google Drive and the existing Google Sheet for the database.
- Access to the target Google Apps Script project.

## 2. Update Backend Code (`Code.gs`)
1. Open your Google Apps Script project.
2. Open the `Code.gs` file.
3. **IMPORTANT:** Replace the **entire content** of `Code.gs` with the code provided below.
4. **CRITICAL:** Update the `SPREADSHEET_ID` at the top of the file with your actual Google Sheet ID.

```javascript
/* 
 * BN Enterprise ERP - Backend
 * v2026.1 (Lao Localization + Asset Audit Fields)
 */

// CONFIGURATION
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE'; // <--- UPDATE THIS ID!!!
const SHEET_NAMES = {
  ACTIVITIES: 'DB_Activities',
  ASSETS: 'Assets_Registry'
};

/* ... (Rest of the provided Code.gs content) ... */
```
*(Use the `Code.gs` content from the file artifact generated in this session)*

## 3. Update Frontend Code (`Index.html`)
1. In the same Google Apps Script project, open `Index.html`.
2. Replace the **entire content** of `Index.html` with the code provided below.
3. This version includes:
   - Full Lao translation for Add/Edit Asset modals.
   - New fields: Serial Number, Vendor, Purchase Date, Warranty Date.
   - "S/N" (Serial Number) column in the Asset Table.
   - Instructors placeholders ("Ghost Text") in Lao.

*(Use the `Index.html` content from the file artifact generated in this session)*

## 4. Deploy as Web App
1. Click **Deploy** > **New deployment**.
2. Select **Type**: **Web app**.
3. **Description**: "v2026 Final - Lao Localization & Asset Governance Audit".
4. **Execute as**: **Me** (your account).
5. **Who has access**: **Anyone** (or your preferred setting).
6. Click **Deploy**.
7. Copy the **Web App URL** and share it with your users.

## 5. Verification Checklist
- [ ] open the Web App URL.
- [ ] Navigate to **Asset Governance**.
- [ ] Check the table header for the new **S/N** column.
- [ ] Click **ເພີ່ມຊັບສິນໃໝ່ (New Asset)**.
- [ ] Verify labels are in Lao (e.g., "ລະຫັດຊັບສິນ", "ເລກຊີຣຽວ").
- [ ] Verify placeholders (ghost text) are in Lao (e.g., "ລະບຸ S/N...").
- [ ] Add a new asset with all fields (including Serial & Vendor).
- [ ] Edit the asset and ensure data loads correctly.
- [ ] Check your Google Sheet (`Assets_Registry`) to see if the new columns (Serial, Vendor, PurchaseDate, WarrantyDate) have been created and populated.

---
**Note:** If you see any caching issues, try opening the Web App URL in an Incognito/Private window.
