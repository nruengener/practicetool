import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:5000', // Make sure this matches your server's URL
});

export default instance;