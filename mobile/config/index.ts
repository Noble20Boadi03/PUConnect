import Constants from 'expo-constants';

// Dynamically resolve local IP address for local development connections
const getApiUrl = () => {
  return 'http://192.168.27.211:5000/api';
};

export const ENV = {
  apiUrl: getApiUrl(),
  environment: Constants.expoConfig?.extra?.environment || 'development',
};

export default ENV;
