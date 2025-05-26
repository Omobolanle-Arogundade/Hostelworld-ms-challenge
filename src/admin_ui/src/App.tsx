import React from 'react';
import { Toaster } from 'react-hot-toast';

import RecordsPage from './pages/RecordsPage';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <RecordsPage />
      <Toaster position="top-right" />
    </div>
  );
};

export default App;
