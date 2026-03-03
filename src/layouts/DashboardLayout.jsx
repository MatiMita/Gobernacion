import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Sidebar from '../components/Sidebar';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">

      {/* Sidebar (drawer flotante en movil, fijo en desktop) */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Area de contenido principal */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Barra superior solo en movil con boton menu */}
        <header className="md:hidden flex items-center h-14 px-4 bg-gradient-to-r from-[#1E3A8A] to-[#152a63] shadow-md flex-shrink-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Abrir menu"
          >
            <Menu size={22} />
          </button>
          <span className="ml-3 font-bold text-white text-sm tracking-wide">
            NGP - Sistema Electoral 2026
          </span>
        </header>

        <main className="flex-1 overflow-y-auto bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
