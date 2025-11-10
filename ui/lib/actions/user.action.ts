import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// Get all users
export const getUsers = async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Token is missing');
  }

  try {
    const response = await axios.get(`${API_URL}/api/users`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (err: any) {
    throw new Error(
      `Error fetching users: ${err.response?.data?.error || err.message}`
    );
  }
};

// Create user
export const createUser = async (formData: {
  name: string;
  employeeId: string;
  role: string;
}) => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Token is missing');
  }

  try {
    const response = await axios.post(`${API_URL}/api/users`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (err: any) {
    throw new Error(
      `Error creating user: ${err.response?.data?.error || err.message}`
    );
  }
};

