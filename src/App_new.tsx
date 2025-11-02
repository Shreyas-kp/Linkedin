import React from 'react';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import PostGenerator from './components/PostGenerator';

function App() {
  return (
    <ThemeProvider>
      <Layout>
        <PostGenerator />
      </Layout>
    </ThemeProvider>
  );
}

export default App;