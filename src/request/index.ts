import axios from 'axios';
axios.defaults.baseURL = 'http://127.0.0.1:3000/';
axios.interceptors.response.use(({ data }) => data);
export const post = async (url: string, obj = {}) => await axios.post(url, obj);

