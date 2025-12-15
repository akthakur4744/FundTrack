import React from 'react';
import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import WebViewScreen from './src/components/WebViewScreen';

export default function App() {
  return (
    <View style={styles.container}>
      <WebViewScreen />
      <StatusBar barStyle="light-content" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
