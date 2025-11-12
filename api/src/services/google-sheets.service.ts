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
        console.log('🔍 Parsing Google Sheets credentials...');
        
        // ลบ whitespace และ newlines ที่ไม่จำเป็น
        let credentialsString = env.googleSheetsCredentials.trim();
        
        // ตรวจสอบและลบ single/double quotes รอบนอก (ถ้ามี)
        if (
          (credentialsString.startsWith("'") && credentialsString.endsWith("'")) ||
          (credentialsString.startsWith('"') && credentialsString.endsWith('"'))
        ) {
          credentialsString = credentialsString.slice(1, -1);
          console.log('⚠️  Removed outer quotes from credentials');
        }

        // Parse JSON
        const credentials = JSON.parse(credentialsString);

        // Validate required fields
        const requiredFields = ['type', 'project_id', 'private_key', 'client_email'];
        const missingFields = requiredFields.filter(field => !credentials[field]);

        if (missingFields.length > 0) {
          throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
        }

        console.log('✅ Credentials parsed successfully');
        console.log(`📧 Service Account Email: ${credentials.client_email}`);

        this.auth = new google.auth.GoogleAuth({
          credentials,
          scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        console.log('✅ Google Auth initialized');
      } catch (error) {
        console.error('❌ Failed to parse Google Sheets credentials:', error);
        console.error('📝 Credential string preview:', env.googleSheetsCredentials?.substring(0, 100) + '...');
        
        if (error instanceof SyntaxError) {
          console.error('💡 Hint: Make sure GOOGLE_SHEETS_CREDENTIALS is valid JSON without outer quotes');
        }
        
        // Don't throw - just log and continue without auth
        this.auth = null;
      }
    } else {
      console.warn('⚠️  GOOGLE_SHEETS_CREDENTIALS not found in environment variables');
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
          values: [[
            record.name,
            record.employeeId,
            record.licensePlate,
            record.borrowDate,
            record.returnDate
          ]],
        },
      });

      console.log('✅ Record appended to Google Sheets successfully');
      return true;
    } catch (error) {
      console.error('❌ Google Sheets error:', error);
      
      if ((error as any).code === 403) {
        console.error('💡 Hint: Make sure you shared the spreadsheet with the service account email');
      } else if ((error as any).code === 404) {
        console.error('💡 Hint: Check if SPREADSHEET_ID is correct');
      }
      
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
        console.log('✅ Headers created in Google Sheets');
      }
    } catch (error) {
      console.error('Error ensuring headers:', error);
    }
  }

  /**
   * ฟังก์ชันสำหรับอัพเดทข้อมูลการคืนรถ
   * ค้นหาแถวที่ตรงกับ employeeId และ licensePlate แล้วอัพเดท returnDate
   */
  async updateReturnDate(
    employeeId: string,
    licensePlate: string,
    returnDate: string
  ): Promise<boolean> {
    if (!this.auth || !this.spreadsheetId) {
      console.warn('Google Sheets not configured, skipping update');
      return false;
    }

    try {
      const sheets = google.sheets({ version: 'v4', auth: this.auth });

      // ดึงข้อมูลทั้งหมด
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'Sheet1!A:E',
      });

      const rows = response.data.values;
      if (!rows || rows.length <= 1) {
        console.warn('No data found in spreadsheet');
        return false;
      }

      // ค้นหาแถวที่ตรงกับเงื่อนไข (เริ่มจากแถวที่ 2 เพราะแถวแรกเป็น header)
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        const rowEmployeeId = row[1]; // คอลัมน์ B (index 1)
        const rowLicensePlate = row[2]; // คอลัมน์ C (index 2)
        const rowReturnDate = row[4]; // คอลัมน์ E (index 4)

        // ถ้าตรงกับเงื่อนไขและยังไม่มีวันที่คืน
        if (
          rowEmployeeId === employeeId &&
          rowLicensePlate === licensePlate &&
          (!rowReturnDate || rowReturnDate.trim() === '')
        ) {
          // อัพเดทวันที่คืน
          const rowNumber = i + 1; // +1 เพราะ Google Sheets เริ่มที่ 1
          await sheets.spreadsheets.values.update({
            spreadsheetId: this.spreadsheetId,
            range: `Sheet1!E${rowNumber}`, // คอลัมน์ E (วันที่คืน)
            valueInputOption: 'RAW',
            requestBody: {
              values: [[returnDate]],
            },
          });

          console.log(`✅ Updated return date at row ${rowNumber}`);
          return true;
        }
      }

      console.warn('No matching record found to update');
      return false;
    } catch (error) {
      console.error('❌ Error updating return date:', error);
      return false;
    }
  }

  /**
   * ดึงข้อมูลทั้งหมดจาก Google Sheets
   */
  async getAllRecords(): Promise<BorrowRecord[]> {
    if (!this.auth || !this.spreadsheetId) {
      console.warn('Google Sheets not configured');
      return [];
    }

    try {
      const sheets = google.sheets({ version: 'v4', auth: this.auth });

      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'Sheet1!A:E',
      });

      const rows = response.data.values;
      if (!rows || rows.length <= 1) {
        return [];
      }

      // แปลง rows เป็น BorrowRecord (ข้าม header row)
      const records: BorrowRecord[] = rows.slice(1).map(row => ({
        name: row[0] || '',
        employeeId: row[1] || '',
        licensePlate: row[2] || '',
        borrowDate: row[3] || '',
        returnDate: row[4] || '',
      }));

      return records;
    } catch (error) {
      console.error('❌ Error fetching records:', error);
      return [];
    }
  }
}