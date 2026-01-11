/**
 * BN Enterprise ERP 2026 - Backend Logic
 * Google Apps Script for Asset Governance & POS
 */

// ==================== CONFIGURATION ====================
// Replace this with your actual Spreadsheet ID
const SPREADSHEET_ID = '1DuvsWQ5q7QuURi5e-y2iIQpD0mHZbK3k'; // <--- UPDATE THIS

const SHEET_NAMES = {
  ASSETS: 'Assets_Registry',
  LOGS: 'OLD_Asset_Logs', // Keeping for backup, moving main logs to DB_Activities
  ACTIVITIES: 'DB_Activities', // NEW: Centralized Activities Database
  STOCK: 'All stock 90-120 BN and Advice',
  PROMOS: 'Generated_Promos'
};

// ==================== WEB APP DEPLOYMENT ====================
function doGet(e) {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('BN Enterprise ERP 2026')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

// ==================== CENTRALIZED ACTIVITY DATABASE ====================
/**
 * Records any system activity to the online database
 * Fields: Timestamp | Module | User | Action | Details | Value
 */
function recordActivity(activityObj) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName(SHEET_NAMES.ACTIVITIES);
    
    // Auto-create DB Sheet if missing
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAMES.ACTIVITIES);
      sheet.appendRow(['Timestamp', 'Module', 'User', 'Action', 'Details', 'Ref_Code', 'Value_Change']);
      sheet.setFrozenRows(1);
    }
    
    sheet.appendRow([
      new Date(),
      activityObj.module || 'System',
      activityObj.user || 'Guest',
      activityObj.action,
      activityObj.details || '-',
      activityObj.refCode || '-',
      activityObj.value || 0
    ]);
    return { success: true };
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

// ==================== ASSET GOVERNANCE FUNCTIONS ====================

/**
 * Save a new asset to the sheet
 */
function saveAsset(assetObj) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName(SHEET_NAMES.ASSETS);
    
    // Create sheet if not exists
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAMES.ASSETS);
      // Added Schema: Code, Folder, Name, Type, Branch, Holder, Value, Status, Note, Updated, Image, Serial, Vendor, PurchaseDate, WarrantyDate
      sheet.appendRow(['Code', 'Folder', 'Name', 'Type', 'Branch', 'Holder', 'Value', 'Status', 'Note', 'Updated', 'Image', 'Serial', 'Vendor', 'PurchaseDate', 'WarrantyDate']);
      sheet.setFrozenRows(1);
    }
    
    // Check dupe (Prevent duplicate asset codes)
    const data = sheet.getDataRange().getValues();
    if (data.length > 1) {
        const exists = data.slice(1).find(row => row[0] === assetObj.code);
        if (exists) return { success: false, error: 'Duplicate Code: ' + assetObj.code };
    }

    // Append with New Fields
    sheet.appendRow([
      assetObj.code,
      assetObj.folder,
      assetObj.name,
      assetObj.type,
      assetObj.branch,
      assetObj.holder,
      assetObj.value,
      assetObj.status,
      assetObj.note,
      new Date(),
      assetObj.image || '',
      assetObj.serial || '-',
      assetObj.vendor || '-',
      assetObj.purchaseDate || '',
      assetObj.warrantyDate || ''
    ]);
    
    // Silent Log to DB
    recordActivity({
      module: 'ASSET',
      user: 'App_User',
      action: 'CREATE',
      details: `Created new asset: ${assetObj.name} (${assetObj.code})`,
      refCode: assetObj.code,
      value: assetObj.value
    });

    return { success: true }; 
  } catch (e) {
    return { success: false, error: e.toString() }; 
  }
}

/**
 * Get all assets (Corrected for DataTables/Array)
 */
function getAssets() {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAMES.ASSETS);
    if (!sheet) return []; // Return empty array if not found
    
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return []; // Only header

    const assets = data.slice(1).map(row => ({
      code: row[0],
      folder: row[1],
      name: row[2],
      type: row[3],
      branch: row[4],
      holder: row[5],
      value: row[6],
      status: row[7],
      note: row[8],
      // row[9] is Updated
      image: row[10] || '',
      serial: row[11] || '',
      vendor: row[12] || '',
      purchaseDate: row[13] ? new Date(row[13]).toISOString().split('T')[0] : '',
      warrantyDate: row[14] ? new Date(row[14]).toISOString().split('T')[0] : ''
    }));
    
    return assets; // Send clean JSON array
  } catch (e) {
    return []; // Fail safe
  }
}

/**
 * Update an existing asset
 */
function updateAsset(assetObj) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAMES.ASSETS);
    if (!sheet) return false;
    
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === assetObj.code) {
        // Map to columns: Code(1)..Image(11)..Warranty(15)
        const rowNum = i + 1;
        
        // Columns: 1:Code, 2:Folder, 3:Name, 4:Type, 5:Branch, 6:Holder, 7:Val, 8:Status, 9:Note, 10:Updated, 11:Image
        // New: 12:Serial, 13:Vendor, 14:PurchaseDate, 15:WarrantyDate
        
        sheet.getRange(rowNum, 2).setValue(assetObj.folder); 
        sheet.getRange(rowNum, 3).setValue(assetObj.name);   
        sheet.getRange(rowNum, 5).setValue(assetObj.branch); 
        sheet.getRange(rowNum, 6).setValue(assetObj.holder); 
        sheet.getRange(rowNum, 8).setValue(assetObj.status); 
        sheet.getRange(rowNum, 9).setValue(assetObj.note);   
        sheet.getRange(rowNum, 10).setValue(new Date());     
        sheet.getRange(rowNum, 11).setValue(assetObj.image || '');
        
        // New Fields Updates
        sheet.getRange(rowNum, 12).setValue(assetObj.serial || '-');
        sheet.getRange(rowNum, 13).setValue(assetObj.vendor || '-');
        sheet.getRange(rowNum, 14).setValue(assetObj.purchaseDate || '');
        sheet.getRange(rowNum, 15).setValue(assetObj.warrantyDate || '');
        
        // Silent Log
        recordActivity({
            module: 'ASSET',
            user: 'App_User',
            action: 'UPDATE',
            details: `Updated info or status to ${assetObj.status}`,
            refCode: assetObj.code,
            value: 0
        });

        return true;
      }
    }
    return false;
  } catch (e) {
    return false;
  }
}

/**
 * Delete an asset
 */
function deleteAsset(code) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAMES.ASSETS);
    if (!sheet) return false;
    
    const data = sheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === code) {
        sheet.deleteRow(i + 1);
        
        recordActivity({
            module: 'ASSET',
            user: 'App_User',
            action: 'DELETE',
            details: `Deleted asset record`,
            refCode: code,
            value: 0
        });

        return true;
      }
    }
    return false;
  } catch (e) {
    return false;
  }
}

/**
 * Legacy Log Function (Redirects to new DB)
 */
function logAction(logObj) {
  return recordActivity({
      module: 'AUDIT',
      user: logObj.user,
      action: logObj.action,
      details: logObj.details,
      refCode: logObj.code
  });
}
