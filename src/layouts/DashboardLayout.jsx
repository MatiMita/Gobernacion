import React from 'react';
import { Outlet } from 'react-router-dom';


import Sidebar from '../components/Sidebar'; 

const DashboardLayout = () => {
  return (
    // Contenedor principal
    <div className="flex h-screen bg-gray-50 font-sans">
      
    
      <Sidebar />

      
      <main className="flex-1 overflow-y-auto bg-gray-50">
      
        <Outlet />
      </main>
      
    </div>
  );
};

export default DashboardLayout;