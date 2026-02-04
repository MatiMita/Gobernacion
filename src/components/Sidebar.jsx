import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut, UserCircle } from 'lucide-react';
import { MENU_ITEMS } from '../config/navigation';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Recuperar sesion del usuario
  const user = JSON.parse(localStorage.getItem('usuario')) || { nombre_usuario: 'Usuario', rol: 'Invitado' };
  
  // Filtrar opciones de menu segun el rol
  const menuPermitido = MENU_ITEMS.filter(item => item.roles.includes(user.rol));

  return (
    <aside className="w-72 bg-white border-r border-gray-200 flex flex-col h-full z-30 font-sans">
      
      {/* Encabezado Institucional */}
      <div className="h-16 flex items-center px-6 border-b border-gray-200 bg-[#E31E24]">
        <div className="flex items-center gap-3 text-white">
            <div className="bg-white/10 p-1.5 rounded-md">
                <span className="font-bold text-sm tracking-widest">SEC</span>
            </div>
            <div className="flex flex-col">
                <span className="font-bold text-sm leading-tight">SISTEMA ELECTORAL</span>
                <span className="text-[10px] opacity-80 uppercase tracking-wider">Cochabamba 2026</span>
            </div>
        </div>
      </div>

      {/* Tarjeta de Usuario */}
      <div className="p-5 border-b border-gray-100 bg-gray-50">
        <div className="flex items-center gap-3">
            <UserCircle size={38} className="text-gray-400" strokeWidth={1.5} />
            <div className="flex flex-col overflow-hidden">
                <span className="font-bold text-gray-800 text-sm truncate" title={user.nombre_usuario}>
                    {user.nombre_usuario}
                </span>
                <span className="text-xs text-gray-500 uppercase font-semibold">
                    {user.rol}
                </span>
            </div>
        </div>
      </div>

      {/* Navegacion Principal */}
      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        <p className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
            Menu Principal
        </p>
        
        {menuPermitido.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon; 

            return (
                <button
                    key={item.id}
                    onClick={() => navigate(item.path)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-150 text-sm font-medium
                        ${isActive 
                            ? 'bg-red-50 text-[#E31E24] border-l-4 border-[#E31E24]' 
                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 border-l-4 border-transparent'
                        }`}
                >
                    <Icon size={18} strokeWidth={2} />
                    {item.label}
                </button>
            )
        })}
      </nav>

      {/* Pie de Pagina */}
      <div className="p-4 border-t border-gray-200">
        <button 
            onClick={() => { localStorage.removeItem('usuario'); navigate('/'); }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-[#E31E24] hover:border-red-200 transition-all text-sm font-semibold"
        >
            <LogOut size={16} />
            Cerrar Sesión
        </button>
        <div className="text-center mt-3">
            <p className="text-[10px] text-gray-400">Versión 1.0.0</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;