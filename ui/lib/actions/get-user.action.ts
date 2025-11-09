//   export async function getAllUsers(): Promise<IUserResponse> {
//   try {
//     const res = await fetch(`${env.API_URL}/api/v2/user`, {
//       method: "GET",
//       headers: {
//         "Content-Type": "application/json",
//         apikey: env.API_KEY,
//         apisecret: env.API_SECRET,
//       },
//     });

//     const { success, data, message } = await res.json();

//     if (success && data) {
//       return { success, data, message };
//     }

//     return {
//       success: false,
//       data: [],
//       error: "Incorrect getAllUsers",
//       message: [],
//     };
//   } catch (err: any) {
//     console.error("[ERROR] getAullUsers", err.message);
//     return {
//       success: false,
//       data: [],
//       error: "Something went wrong at server side.",
//       message: [],
//     };
//   }
// }

  
  //  await api.post('/users', formData, {
  //     headers: {
  //       Authorization: `Bearer ${tokens}`, // ส่ง token ใน header
  //     },
  //   });

    
import axios from 'axios';

// สร้างฟังก์ชันสำหรับส่งคำขอ POST เพื่อสร้างผู้ใช้ใหม่
export const createUser = async (formData: { name: string; employeeId: string; role: string }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Token is missing');
  }

  try {
    const response = await axios.post('/users', formData, {
      headers: {
        Authorization: `Bearer ${token}`, // ส่ง token ใน header
      },
    });
    return response.data;
  } catch (err: any) {
    throw new Error(`Error creating user: ${err.response?.data?.error || err.message}`);
  }
};

// สร้างฟังก์ชันสำหรับดึงข้อมูลผู้ใช้
export const getUser = async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Token is missing');
  }

  try {
    const response = await axios.get('/users', {
      headers: {
        Authorization: `Bearer ${token}`, // ส่ง token ใน header
      },
    });
    return response.data;
  } catch (err : any) {
    throw new Error(`Error fetching users: ${err.response?.data?.error || err.message}`);
  }
};
