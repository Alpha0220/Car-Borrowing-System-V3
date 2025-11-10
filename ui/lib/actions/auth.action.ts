import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// Login action
export const login = async (employeeId: string, password: string) => {
  try {
    const response = await axios.post(`${API_URL}/api/auth/login`, {
      employeeId,
      password,
    });
    return response.data;
  } catch (err: any) {
    throw new Error(
      `Error logging in: ${err.response?.data?.error || err.message}`
    );
  }
};

// Register action
export const register = async (employeeId: string, password: string) => {
  try {
    const response = await axios.post(`${API_URL}/api/auth/register`, {
      employeeId,
      password,
    });
    return response.data;
  } catch (err: any) {
    throw new Error(
      `Error registering: ${err.response?.data?.error || err.message}`
    );
  }
};

