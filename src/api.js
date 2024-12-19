import axios from 'axios';

const VUE_APP_API_URL = process.env.VUE_APP_API_URL;
console.log(VUE_APP_API_URL);

export const signup = async (username, email, password) => {
  const response = await axios.post(`${VUE_APP_API_URL}/signup`, { username, email, password });
  return response.data;
};

export const login = async (email, password) => {
  const response = await axios.post(`${VUE_APP_API_URL}/login`, { email, password });
  return response.data;
};
