import { google } from 'googleapis';

const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
// Handle newlines in the private key from .env.local
const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
const spreadsheetId = process.env.GOOGLE_SHEET_ID;

const auth = new google.auth.JWT({
  email: clientEmail,
  key: privateKey,
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});


const sheets = google.sheets({ version: 'v4', auth });

const HEADERS = [
  'ID',
  'Devotee Name',
  'Email',
  'Phone',
  'Seva Name',
  'Date',
  'Time',
  'Gotra',
  'Nakshatra',
  'Number of People',
  'Status',
  'Total Cost',
  'Created At'
];

/**
 * Ensures the Google Sheet has the correct header row if it is empty.
 */
async function ensureHeaders() {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Bookings!A1:Z1',
    });
    
    if (!response.data.values || response.data.values.length === 0) {
      // Sheet is empty, write headers
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: 'Bookings!A1',
        valueInputOption: 'RAW',
        requestBody: {
          values: [HEADERS],
        },
      });
      console.log('✅ Headers written to Google Sheet');
    }
  } catch (error: any) {
    // If the sheet "Bookings" does not exist, Google Sheets API will fail. 
    // We can try to write to Sheet1!A1 or default range, but usually we just log and throw.
    console.error('Error verifying headers (Ensure a tab named "Bookings" exists):', error.message);
  }
}

export async function getBookings() {
  try {
    await ensureHeaders();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Bookings!A2:M10000',
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      return [];
    }

    return rows.map((row) => ({
      id: parseInt(row[0]) || row[0],
      devoteeName: row[1] || '',
      email: row[2] || '',
      phone: row[3] || '',
      sevaName: row[4] || '',
      date: row[5] || '',
      time: row[6] || '',
      gotra: row[7] || '',
      nakshatra: row[8] || '',
      numberOfPeople: parseInt(row[9]) || 1,
      status: row[10] || 'pending',
      totalCost: row[11] || '',
      createdAt: row[12] || '',
    }));
  } catch (error: any) {
    console.error('Error fetching bookings from Sheets:', error.message);
    return [];
  }
}

export async function addBooking(booking: any) {
  try {
    await ensureHeaders();
    
    const row = [
      booking.id,
      booking.devoteeName || booking.fullName || '',
      booking.email || '',
      booking.phone || '',
      booking.sevaName || '',
      booking.date || '',
      booking.time || '',
      booking.gotra || '',
      booking.nakshatra || '',
      booking.numberOfPeople || 1,
      booking.status || 'confirmed',
      booking.totalCost || '',
      booking.createdAt || new Date().toISOString()
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Bookings!A:M',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [row],
      },
    });

    console.log(`✅ Booking appended to Sheets: ${booking.id}`);
    return true;
  } catch (error: any) {
    console.error('Error adding booking to Sheets:', error.message);
    throw error;
  }
}

export async function updateBookingStatus(id: number | string, status: string) {
  try {
    await ensureHeaders();
    
    // Fetch all current values to find the row index
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Bookings!A1:A10000',
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      throw new Error('No bookings found to update');
    }

    // Find row (1-indexed in Google Sheets)
    const targetIdStr = String(id).trim();
    let rowIndex = -1;
    for (let i = 0; i < rows.length; i++) {
      if (String(rows[i][0]).trim() === targetIdStr) {
        rowIndex = i + 1; // Google Sheets is 1-indexed
        break;
      }
    }

    if (rowIndex === -1) {
      throw new Error(`Booking ID ${id} not found in sheet`);
    }

    // Status is in Column K (11th column, index 10)
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `Bookings!K${rowIndex}`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [[status]],
      },
    });

    console.log(`✅ Booking ${id} status updated to: ${status} at row ${rowIndex}`);
    return true;
  } catch (error: any) {
    console.error(`Error updating booking status in Sheets:`, error.message);
    throw error;
  }
}
