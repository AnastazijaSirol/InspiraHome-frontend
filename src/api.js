
import axios from 'axios';

const API_URL = 'http://localhost:3000/api'; 

export const signup = async (username, email, password) => {
  const response = await axios.post(`${API_URL}/signup`, { username, email, password });
  return response.data;
};

export const login = async (email, password) => {
  const response = await axios.post(`${API_URL}/login`, { email, password });
  return response.data;
};