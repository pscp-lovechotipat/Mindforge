import axios from "axios";

const aiService = axios.create({
    baseURL: process.env.AI_SERVICE_URL
});

export default aiService;