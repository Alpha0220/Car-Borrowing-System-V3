import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// Get my borrows
export const getMyBorrows = async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Token is missing');
  }

  try {
    const response = await axios.get(`${API_URL}/api/borrows/my`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (err: any) {
    throw new Error(
      `Error fetching my borrows: ${err.response?.data?.error || err.message}`
    );
  }
};

// Get pending borrows
export const getPendingBorrows = async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Token is missing');
  }

  try {
    const response = await axios.get(`${API_URL}/api/borrows/pending`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (err: any) {
    throw new Error(
      `Error fetching pending borrows: ${err.response?.data?.error || err.message}`
    );
  }
};

// Get reports with filters
export const getReports = async (filters?: {
  status?: string;
  borrowDateFrom?: string;
  borrowDateTo?: string;
}) => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Token is missing');
  }

  try {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.borrowDateFrom)
      params.append('borrowDateFrom', filters.borrowDateFrom);
    if (filters?.borrowDateTo)
      params.append('borrowDateTo', filters.borrowDateTo);

    const response = await axios.get(
      `${API_URL}/api/borrows/reports?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (err: any) {
    throw new Error(
      `Error fetching reports: ${err.response?.data?.error || err.message}`
    );
  }
};

// Create borrow request
export const createBorrow = async (licensePlate: string) => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Token is missing');
  }

  try {
    const response = await axios.post(
      `${API_URL}/api/borrows`,
      { licensePlate },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (err: any) {
    throw new Error(
      `Error creating borrow request: ${err.response?.data?.error || err.message}`
    );
  }
};

// Approve borrow
export const approveBorrow = async (
  borrowId: string,
  data: {
    startMileage: number;
    fuelUsedLiters?: number;
  }
) => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Token is missing');
  }

  try {
    const response = await axios.patch(
      `${API_URL}/api/borrows/${borrowId}/approve`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (err: any) {
    throw new Error(
      `Error approving borrow: ${err.response?.data?.error || err.message}`
    );
  }
};

// Return vehicle
export const returnVehicle = async (borrowId: string, endMileage: number) => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Token is missing');
  }

  try {
    const response = await axios.patch(
      `${API_URL}/api/borrows/${borrowId}/return`,
      { endMileage },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (err: any) {
    throw new Error(
      `Error returning vehicle: ${err.response?.data?.error || err.message}`
    );
  }
};

