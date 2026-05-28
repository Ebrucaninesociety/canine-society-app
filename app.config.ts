import { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'Canine Society',
  slug: 'canine-society-app',
  scheme: 'caninesociety',
  version: '0.1.0',
  orientation: 'portrait',
  userInterfaceStyle: 'light',
  newArchEnabled: true,
  backgroundColor: '#F3E8D4',
  splash: {
    backgroundColor: '#F3E8D4',
    resizeMode: 'contain',
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    bundleIdentifier: 'com.caninesociety.app',
    supportsTablet: false,
    backgroundColor: '#F3E8D4',
  },
  android: {
    package: 'com.caninesociety.app',
    adaptiveIcon: {
      backgroundColor: '#F3E8D4',
    },
  },
  plugins: ['expo-router'],
  experiments: { typedRoutes: false },
};

export default config;
