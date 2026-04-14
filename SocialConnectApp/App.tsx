import React, { createContext, useState } from 'react';
import { StatusBar } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';

// TypeScript fix: Adding a default value to createContext
export const ThemeContext = createContext<any>(null);

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const theme = {
    dark: isDarkMode,
    colors: {
      background: isDarkMode ? '#121212' : '#f4f7f6',
      card: isDarkMode ? '#1e1e1e' : '#ffffff',
      text: isDarkMode ? '#ffffff' : '#1a1a1a',
      subText: isDarkMode ? '#aaa' : '#666',
      primary: '#007bff',
      border: isDarkMode ? '#333' : '#eee',
    },
    toggleTheme: () => setIsDarkMode(!isDarkMode),
  };

  return (
    <ThemeContext.Provider value={theme}>
      <StatusBar 
        barStyle={isDarkMode ? "light-content" : "dark-content"} 
        backgroundColor={theme.colors.card} 
      />
      <AppNavigator />
    </ThemeContext.Provider>
  );
}