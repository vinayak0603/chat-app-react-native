import axios from 'axios';

const API = axios.create({
  baseURL: 'http://192.168.0.107:5000/api', // Replace <YOUR_IP> with local IP like 192.168.x.x
});

export default API;
