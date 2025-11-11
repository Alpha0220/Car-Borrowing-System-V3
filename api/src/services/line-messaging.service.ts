import { env } from '../config/env';

type LineMessage = {
  type: 'text';
  text: string;
};

export class LineMessagingService {
  private readonly channelAccessToken: string;

  constructor() {
    this.channelAccessToken = env.lineChannelAccessToken;
  }

  async sendNotification(message: string): Promise<boolean> {
    if (!this.channelAccessToken) {
      console.warn('LINE Messaging channel access token not configured, skipping notification');
      return false;
    }

    const payload = {
      messages: [this.buildTextMessage(message)],
    };

    try {
      const response = await fetch('https://api.line.me/v2/bot/message/broadcast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.channelAccessToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error('LINE Messaging API error:', response.status, errorBody);
      }

      return response.ok;
    } catch (error) {
      console.error('LINE Messaging API request failed:', error);
      return false;
    }
  }

  formatBorrowRequestMessage(
    employeeName: string,
    employeeId: string,
    licensePlate: string,
    borrowDate: Date
  ): string {
    return [
      '🚗 คำขอเบิกรถใหม่',
      '',
      `ชื่อ: ${employeeName}`,
      `รหัสพนักงาน: ${employeeId}`,
      `ทะเบียนรถ: ${licensePlate}`,
      `วันที่: ${borrowDate.toLocaleString('th-TH')}`,
    ].join('\n');
  }

  formatApprovalMessage(employeeName: string, licensePlate: string): string {
    return [
      '✅ อนุมัติการเบิกรถ',
      '',
      `ชื่อ: ${employeeName}`,
      `ทะเบียนรถ: ${licensePlate}`,
      'สถานะ: อนุมัติแล้ว',
    ].join('\n');
  }

  formatReturnMessage(employeeName: string, licensePlate: string, returnDate: Date): string {
    return [
      '🔄 คืนรถแล้ว',
      '',
      `ชื่อ: ${employeeName}`,
      `ทะเบียนรถ: ${licensePlate}`,
      `วันที่คืน: ${returnDate.toLocaleString('th-TH')}`,
    ].join('\n');
  }

  private buildTextMessage(text: string): LineMessage {
    return {
      type: 'text',
      text,
    };
  }
}


