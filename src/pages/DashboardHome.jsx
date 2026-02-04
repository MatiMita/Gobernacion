import React from 'react';
import { Users, FileText, AlertCircle, CheckCircle2, TrendingUp, Clock } from 'lucide-react';

const DashboardHome = () => {
  // Recuperamos el rol
  const user = JSON.parse(localStorage.getItem('usuario')) || { rol: 'Invitado' };

  return (
    <div className="p-8 bg-gray-50/50 min-h-screen">
      
      {/* 1. Saludo  */}
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">Hola, {user.nombre_usuario} </h1>
        <p className="text-gray-500 mt-1">
            Panel de control para <span className="font-bold text-[#E31E24]">{user.rol}</span>.
        </p>
      </header>

      {/* 2. CONTENIDO SEGÚN ROL */}
      
      {/* --- VISTA DE ADMINISTRADOR --- */}
      {user.rol === 'Administrador del Sistema' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard title="Usuarios Totales" value="124" icon={<Users className="text-blue-500"/>} color="border-blue-500" />
            <StatCard title="Mesas Habilitadas" value="1,250" icon={<FileText className="text-purple-500"/>} color="border-purple-500" />
            <StatCard title="Avance Global" value="68%" icon={<TrendingUp className="text-green-500"/>} color="border-green-500" />
            <StatCard title="Incidencias" value="12" icon={<AlertCircle className="text-red-500"/>} color="border-red-500" />
            
            <div className="md:col-span-4 mt-6 p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-4">Actividad Reciente del Sistema</h3>
                
                <div className="h-48 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
                    [Gráfico de barras: Votos por hora]
                </div>
            </div>
        </div>
      )}

      {/* --- VISTA DE TRANSCRIPTOR --- */}
      {user.rol === 'Transcriptor de Actas' && (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Mis Actas Hoy" value="15" icon={<FileText className="text-blue-500"/>} color="border-blue-500" />
                <StatCard title="Tiempo Promedio" value="4m 20s" icon={<Clock className="text-orange-500"/>} color="border-orange-500" />
                <StatCard title="Eficiencia" value="98%" icon={<TrendingUp className="text-green-500"/>} color="border-green-500" />
            </div>

            <div className="bg-[#E31E24] rounded-2xl p-8 text-white shadow-xl flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold mb-2">¿Listo para continuar?</h2>
                    <p className="text-red-100">Tienes 5 actas asignadas esperando transcripción.</p>
                </div>
                <button className="bg-white text-[#E31E24] px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-yellow-50 transition transform hover:scale-105">
                    Comenzar Transcripción
                </button>
            </div>
        </div>
      )}

      {/* --- VISTA DE VALIDADOR --- */}
      {user.rol === 'Validador de Actas' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard title="Por Validar" value="45" icon={<AlertCircle className="text-orange-500"/>} color="border-orange-500" />
            <StatCard title="Aprobadas Hoy" value="120" icon={<CheckCircle2 className="text-green-500"/>} color="border-green-500" />
            <StatCard title="Rechazadas" value="3" icon={<AlertCircle className="text-red-500"/>} color="border-red-500" />

            <div className="md:col-span-3 mt-6">
                <h3 className="font-bold text-gray-800 mb-4 text-lg">Cola de Validación Prioritaria</h3>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    {[1,2,3].map(i => (
                        <div key={i} className="p-4 border-b border-gray-50 flex justify-between items-center hover:bg-gray-50 transition">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-500">M{i}</div>
                                <div>
                                    <p className="font-bold text-gray-800">Mesa #{4500 + i}</p>
                                    <p className="text-xs text-gray-500">Recinto: Colegio San Agustín</p>
                                </div>
                            </div>
                            <button className="text-blue-600 font-bold text-sm hover:underline">Revisar</button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      )}

    </div>
  );
};

// Componente Tarjeta Simple
const StatCard = ({ title, value, icon, color }) => (
    <div className={`bg-white p-6 rounded-2xl shadow-sm border-l-4 ${color} flex items-center justify-between`}>
        <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{title}</p>
            <h3 className="text-3xl font-black text-gray-800">{value}</h3>
        </div>
        <div className="p-3 bg-gray-50 rounded-xl">
            {icon}
        </div>
    </div>
);

export default DashboardHome;