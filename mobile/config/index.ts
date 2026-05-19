import Constants from 'expo-constants';

export const ENV = {
  apiUrl: Constants.expoConfig?.extra?.apiUrl || 'https://api.example.com',
  environment: Constants.expoConfig?.extra?.environment || 'development',
};

export default ENV;
