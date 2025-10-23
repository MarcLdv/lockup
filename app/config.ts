import { Platform } from 'react-native';
import Constants from 'expo-constants';


const envUrl = process.env.EXPO_PUBLIC_API_URL;

import { BASE_API_URL, getApiBase } from '../lib/config';

export { BASE_API_URL, getApiBase };

export default function ConfigStub() {
  return null;
}
