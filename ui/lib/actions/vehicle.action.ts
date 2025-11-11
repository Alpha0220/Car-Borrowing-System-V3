import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// Get all vehicles
export const getVehicles = async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Token is missing');
  }

  try {
    const response = await axios.get(`${API_URL}/api/vehicles`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (err: any) {
    throw new Error(
      `Error fetching vehicles: ${err.response?.data?.error || err.message}`
    );
  }
};

// Get vehicle summary
export const getVehicleSummary = async (vehicleId: string) => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Token is missing');
  }

  try {
    const response = await axios.get(`${API_URL}/api/vehicles/${vehicleId}/summary`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (err: any) {
    throw new Error(
      `Error fetching vehicle summary: ${err.response?.data?.error || err.message}`
    );
  }
};

// Create vehicle
export const createVehicle = async (formData: {
  licensePlate: string;
  easypassBalance?: number;
}) => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Token is missing');
  }

  try {
    const response = await axios.post(`${API_URL}/api/vehicles`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (err: any) {
    throw new Error(
      `Error creating vehicle: ${err.response?.data?.error || err.message}`
    );
  }
};

// Update vehicle
export const updateVehicle = async (
  vehicleId: string,
  formData: {
    status?: string;
    easypassBalance?: number;
  }
) => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Token is missing');
  }

  try {
    const response = await axios.patch(
      `${API_URL}/api/vehicles/${vehicleId}`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (err: any) {
    throw new Error(
      `Error updating vehicle: ${err.response?.data?.error || err.message}`
    );
  }
};

