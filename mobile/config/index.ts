import Constants from 'expo-constants';

// Dynamically resolve local IP address for local development connections
const getApiUrl = () => {
  // Constants.expoConfig.hostUri gives us the IP:PORT of the machine running the Expo server
  // e.g., "192.168.1.10:8081"
  const debuggerHost = Constants.expoConfig?.hostUri;
  const localhost = debuggerHost?.split(':').shift() || 'localhost';
  
  // During development with a physical device, we use the PC's local IP
  if (__DEV__) {
    return `http://${localhost}:5000/api`;
  }
  
  // Fallback to production API or environment variable
  return Constants.expoConfig?.extra?.apiUrl || 'https://api.puconnect.com/api';
};

export const ENV = {
  apiUrl: getApiUrl(),
  environment: Constants.expoConfig?.extra?.environment || 'development',
};

export default ENV;
