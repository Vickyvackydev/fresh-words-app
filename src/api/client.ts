import axios from "axios";
import Constants from "expo-constants";

export const getBaseUrl = () => {
  // Extract host IP in Expo Go development environment to connect to local backend server
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const ip = hostUri.split(":")[0];
    return `http://${ip}:8080/api/v1`;
  }
  return "http://localhost:8080/api/v1";
};

export const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});
