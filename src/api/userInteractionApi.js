import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api'

export const setFavouriteStatus = async ({ property_id, isFavourite }) => {
    const token = localStorage.getItem('token');
    const config = {
        headers: {
            'Content-Type' : 'application/json',
            'Authorization' : `Bearer ${token}`
        },
    };

    const response = await axios.post(
        `${API_URL}/user-interactions/favourite`,
        {property_id, isFavourite},
        config
    );
    return response.data;
};

export const isFavouriteStatus = async ({ property_id }) => {
    const token = localStorage.getItem('token');
    const config = {
        headers: {
            'Content-Type' : 'application/json',
            'Authorization' : `Bearer ${token}`
        },
    };

    const response = await axios.get(`${API_URL}/user-interactions/favourite/${property_id}`, config);
    return response.data;
}

// Get user favourite properties
export const getFavouriteProperties = async () => {
    const token = localStorage.getItem('token');
    const config = {
        headers: {
            'Content-Type' : 'application/json',
            'Authorization' : `Bearer ${token}`
        },
    };

    const response = await axios.get(`${API_URL}/user-interactions/favourite`, config);
    return response.data;
};

export const submitComplaint = async ({ property_id, complaint }) => {
    const token = localStorage.getItem('token');
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    };
    const response = await axios.post(
      `${API_URL}/user-interactions/complaint`,
      { property_id, complaint },
      config
    );
    return response.data;
}; 

export const getPropertyComplaints = async () => {
    const token = localStorage.getItem('token');
    const config = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    };

    const response = await axios.get(`${API_URL}/user-interactions/complaints`, config);
    return response.data;
};