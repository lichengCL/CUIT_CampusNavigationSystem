import axios from "axios";


const client = axios.create({
  baseURL: process.env.REACT_APP_API_BASE || "http://localhost:8000/api",
  timeout: 10000
});

export default client;
