// import { env } from "../config/env";

// type LineMessage = {
//   type: 'text';
//   text: string;
// };

// const approvalsUrl = env.approvalsUrl;

// export class LineMessagingService {
//   private readonly channelAccessToken: string;

//   constructor() {
//     this.channelAccessToken = env.lineChannelAccessToken;
//   }

//   async sendNotification(toId: string , message: string): Promise<boolean> {
//     if (!this.channelAccessToken) {
//       console.warn('LINE Messaging channel access token not configured, skipping notification');
//       return false;
//     }

//     const payload = {
//       messages: [this.buildTextMessage(message)],
//     };

//     try {
//       const response = await fetch('https://api.line.me/v2/bot/message/broadcast', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${this.channelAccessToken}`,
//         },
//         body: JSON.stringify(payload),
//       });

//       if (!response.ok) {
//         const errorBody = await response.text();
//         console.error('LINE Messaging API error:', response.status, errorBody);
//       }

//       return response.ok;
//     } catch (error) {
//       console.error('LINE Messaging API request failed:', error);
//       return false;
//     }
//   }

//   formatBorrowRequestMessage(
//     employeeName: string,
//     employeeId: string,
//     licensePlate: string,
//     borrowDate: Date,
//   ): string {
//     return [
//       `${approvalsUrl}`,
//       '🚗 คำขอเบิกรถใหม่',
//       '',
//       `ชื่อ: ${employeeName}`,
//       `รหัสพนักงาน: ${employeeId}`,
//       `ทะเบียนรถ: ${licensePlate}`,
//       `วันที่: ${borrowDate.toLocaleString('th-TH')}`,
//     ].join('\n');
//   }

//   formatApprovalMessage(employeeName: string, licensePlate: string): string {
//     return [
//       '✅ อนุมัติการเบิกรถ',
//       '',
//       `ชื่อ: ${employeeName}`,
//       `ทะเบียนรถ: ${licensePlate}`,
//       'สถานะ: อนุมัติแล้ว',
//     ].join('\n');
//   }

//   formatReturnMessage(employeeName: string, licensePlate: string, returnDate: Date): string {
//     return [
//       '🔄 คืนรถแล้ว',
//       '',
//       `ชื่อ: ${employeeName}`,
//       `ทะเบียนรถ: ${licensePlate}`,
//       `วันที่คืน: ${returnDate.toLocaleString('th-TH')}`,
//     ].join('\n');
//   }

//   private buildTextMessage(text: string): LineMessage {
//     return {
//       type: 'text',
//       text,
//     };
//   }
// }


// ================================ send notification to line group ================================
import { env } from "../config/env";

type LineMessage = {
  type: 'text';
  text: string;
};

const approvalsUrl = env.approvalsUrl;

/**
 * Service class for interacting with the LINE Messaging API.
 */
export class LineMessagingService {
  private readonly channelAccessToken: string;
  private readonly pushEndpoint = 'https://api.line.me/v2/bot/message/push'; // Endpoint สำหรับส่งข้อความแบบเจาะจง

  constructor() {
    this.channelAccessToken = env.lineChannelAccessToken;
  }

  /**
   * Sends a notification message to a specific recipient (User, Group, or Room).
   * * @param toId The User ID, Group ID, or Room ID of the recipient.
   * @param message The text content of the notification.
   * @returns A Promise resolving to true if the message was sent successfully, false otherwise.
   */
  async sendNotification(toId: string, message: string): Promise<boolean> {
    if (!this.channelAccessToken) {
      console.warn('LINE Messaging channel access token not configured, skipping notification');
      return false;
    }

    const payload = {
      to: toId || env.lineGroupId, 
      messages: [this.buildTextMessage(message)],
    };

    try {
      const response = await fetch(this.pushEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.channelAccessToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        // แสดงข้อผิดพลาดที่ชัดเจนขึ้น รวมถึง Endpoint ที่ใช้
        console.error(`LINE Messaging API (Push) error: Status ${response.status}`, errorBody);
      }

      return response.ok;
    } catch (error) {
      console.error('LINE Messaging API request failed:', error);
      return false;
    }
  }

  // --- Message Formatters (เหมือนเดิม) ---

  formatBorrowRequestMessage(
    employeeName: string,
    employeeId: string,
    licensePlate: string,
    borrowDate: Date
  ): string {
    return [
      `${approvalsUrl}`,
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