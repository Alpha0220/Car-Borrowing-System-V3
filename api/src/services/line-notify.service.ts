import { env } from '../config/env';

export class LineNotifyService {
  private token: string;

  constructor() {
    this.token = env.lineNotifyToken;
  }

  async sendNotification(message: string): Promise<boolean> {
    if (!this.token) {
      console.warn('LINE Notify token not configured, skipping notification');
      return false;
    }

    try {
      const response = await fetch('https://notify-api.line.me/api/notify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Bearer ${this.token}`,
        },
        body: new URLSearchParams({ message }),
      });

      return response.ok;
    } catch (error) {
      console.error('LINE Notify error:', error);
      return false;
    }
  }

  formatBorrowRequestMessage(
    employeeName: string,
    employeeId: string,
    licensePlate: string,
    borrowDate: Date
  ): string {
    return `🚗 คำขอเบิกรถใหม่\n\nชื่อ: ${employeeName}\nรหัสพนักงาน: ${employeeId}\nทะเบียนรถ: ${licensePlate}\nวันที่: ${borrowDate.toLocaleString('th-TH')}`;
  }

  formatApprovalMessage(employeeName: string, licensePlate: string): string {
    return `✅ อนุมัติการเบิกรถ\n\nชื่อ: ${employeeName}\nทะเบียนรถ: ${licensePlate}\nสถานะ: อนุมัติแล้ว`;
  }

  formatReturnMessage(employeeName: string, licensePlate: string, returnDate: Date): string {
    return `🔄 คืนรถแล้ว\n\nชื่อ: ${employeeName}\nทะเบียนรถ: ${licensePlate}\nวันที่คืน: ${returnDate.toLocaleString('th-TH')}`;
  }
}

