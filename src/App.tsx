import React from 'react';
import { AppLayout } from './components/app-layout/AppLayout';
import { HomePage } from './pages/home-page/HomePage';
import './App.css';

function App() {
  return (
    <AppLayout>
      <HomePage />
    </AppLayout>
  );
}

export default App;
