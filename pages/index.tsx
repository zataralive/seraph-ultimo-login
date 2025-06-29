
import React from 'react';
import App from '../App'; // Assuming App.tsx is in the root directory (one level up)

// This component now acts as the entry point for the Next.js page,
// delegating all game rendering and logic to the App component.
const SeraphGamePage: React.FC = () => {
  return <App />;
};

export default SeraphGamePage;
