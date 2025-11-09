import { google } from 'googleapis';
import { env } from '../config/env';

export interface BorrowRecord {
  name: string;
  employeeId: string;
  licensePlate: string;
  borrowDate: string;
  returnDate: string;
}

export class GoogleSheetsService {
  private spreadsheetId: string;
  private auth: any;

  constructor() {
    this.spreadsheetId = env.googleSheetsSpreadsheetId;

    if (env.googleSheetsCredentials) {
      try {
        const credentials = JSON.parse(env.googleSheetsCredentials);
        this.auth = new google.auth.GoogleAuth({
          credentials,
          scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });
      } catch (error) {
        console.error('Failed to parse Google Sheets credentials:', error);
      }
    }
  }

  async appendRecord(record: BorrowRecord): Promise<boolean> {
    if (!this.auth || !this.spreadsheetId) {
      console.warn('Google Sheets not configured, skipping record');
      return false;
    }

    try {
      const sheets = google.sheets({ version: 'v4', auth: this.auth });

      // Ensure header row exists
      await this.ensureHeaders(sheets);

      // Append data
      await sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: 'Sheet1!A:E',
        valueInputOption: 'RAW',
        requestBody: {
          values: [[record.name, record.employeeId, record.licensePlate, record.borrowDate, record.returnDate]],
        },
      });

      return true;
    } catch (error) {
      console.error('Google Sheets error:', error);
      return false;
    }
  }

  private async ensureHeaders(sheets: any): Promise<void> {
    try {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'Sheet1!A1:E1',
      });

      if (!response.data.values || response.data.values.length === 0) {
        // Add headers
        await sheets.spreadsheets.values.update({
          spreadsheetId: this.spreadsheetId,
          range: 'Sheet1!A1:E1',
          valueInputOption: 'RAW',
          requestBody: {
            values: [['ชื่อ', 'รหัสพนักงาน', 'ทะเบียนรถ', 'วันที่เบิก', 'วันที่คืน']],
          },
        });
      }
    } catch (error) {
      console.error('Error ensuring headers:', error);
    }
  }
}

