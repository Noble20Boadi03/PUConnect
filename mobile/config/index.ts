import Constants from 'expo-constants';

// 1. Define production URLs
const productionApiUrl = Constants.expoConfig?.extra?.apiUrl;
const productionSocketUrl = Constants.expoConfig?.extra?.socketUrl;

// 2. Define dev URLs using the local IP
const getDevApiUrl = () => {
  const debuggerHost = Constants.expoConfig?.hostUri;
  const localhost = debuggerHost?.split(':').shift() || 'localhost';
  return `http://${localhost}:5000/api`;
};

const getDevSocketUrl = () => {
  const debuggerHost = Constants.expoConfig?.hostUri;
  const localhost = debuggerHost?.split(':').shift() || 'localhost';
  return `http://${localhost}:5000`;
};

// 3. Export single URLs based on whether a valid production URL is configured
const useProductionApi = productionApiUrl && productionApiUrl.startsWith('https://');
const useProductionSocket = productionSocketUrl && productionSocketUrl.startsWith('https://');

export const ENV = {
  apiUrl: useProductionApi ? productionApiUrl : getDevApiUrl(),
  socketUrl: useProductionSocket ? productionSocketUrl : getDevSocketUrl(),
  environment: Constants.expoConfig?.extra?.environment || 'development',
  supabaseUrl: Constants.expoConfig?.extra?.supabaseUrl || '',
  supabaseAnonKey: Constants.expoConfig?.extra?.supabaseAnonKey || '',
};

export default ENV;
