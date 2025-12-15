import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import WebView from 'react-native-webview';
import Constants from 'expo-constants';

export default function WebViewScreen() {
  const [webViewUrl, setWebViewUrl] = useState<string>('http://localhost:3000');

  useEffect(() => {
    // In production, this would point to your deployed Next.js app
    // const productionUrl = process.env.EXPO_PUBLIC_WEBVIEW_URL || 'http://localhost:3000';
    // setWebViewUrl(productionUrl);
  }, []);

  return (
    <View style={styles.container}>
      <WebView
        source={{ uri: webViewUrl }}
        style={styles.webView}
        javaScriptEnabled={true}
        scalesPageToFit={true}
        startInLoadingState={true}
        // Add custom user agent if needed
        userAgent="FundTrack-Mobile/1.0"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: Constants.statusBarHeight,
  },
  webView: {
    flex: 1,
  },
});
