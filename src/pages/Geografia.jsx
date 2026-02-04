
import React, { useState } from 'react';
import { Map, MapPin, Plus, Search, Filter } from 'lucide-react';

const Geografia = () => {
  const [departamento, setDepartamento] = useState('Cochabamba');

  // Datos de prueba
  const provinciasData = [
    { id: 1, nombre: 'Cercado', municipios: 1, recintos: 87 },
    { id: 2, nombre: 'Quillacollo', municipios: 5, recintos: 42 },
    { id: 3, nombre: 'Chapare', municipios: 3, recintos: 28 },
    { id: 4, nombre: 'Esteban Arce', municipios: 4, recintos: 15 },
    { id: 5, nombre: 'Punata', municipios: 5, recintos: 19 },
  ];

  return (
    <div className="p-6 min-h-screen bg-gray-50 font-sans">
      
      {/* 1. CABECERA (Limpia y consistente con el Dashboard) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                <span className="w-2 h-8 bg-[#E31E24] rounded-sm block"></span>
                Parámetros Geográficos
            </h1>
            <p className="text-gray-500 text-sm mt-1 ml-4">
                Gestión de la estructura territorial del departamento.
            </p>
        </div>
        
        {/* Botón de Acción Principal */}
        <button className="bg-gray-900 hover:bg-gray-800 text-white px-5 py-3 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg transition-all transform hover:-translate-y-0.5">
            <Plus size={18} />
            Nueva Provincia
        </button>
      </div>

      {/* 2. TARJETA DE CONTENIDO */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        
        {/* FILTROS Y BUSCADOR */}
        <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row gap-4 items-end">
            
            {/* Filtro Departamento */}
            <div className="w-full md:w-64">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">
                    Filtrar por Departamento
                </label>
                <div className="relative group">
                    <select 
                        value={departamento}
                        onChange={(e) => setDepartamento(e.target.value)}
                        className="w-full pl-4 pr-10 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 font-bold focus:ring-2 focus:ring-red-100 focus:border-[#E31E24] outline-none appearance-none transition-all cursor-pointer hover:border-gray-300"
                    >
                        <option value="Cochabamba">Cochabamba</option>
                        <option value="La Paz">La Paz</option>
                        <option value="Santa Cruz">Santa Cruz</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-[#E31E24] transition-colors">
                        <MapPin size={18} />
                    </div>
                </div>
            </div>

            {/* Buscador */}
            <div className="flex-1 w-full">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">
                    Buscar Provincia
                </label>
                <div className="relative group">
                    <input 
                        type="text" 
                        placeholder="Ej: Quillacollo..."
                        className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 font-medium focus:ring-2 focus:ring-red-100 focus:border-[#E31E24] outline-none transition-all placeholder:text-gray-400"
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-focus-within:text-[#E31E24] transition-colors">
                        <Search size={18} />
                    </div>
                </div>
            </div>
        </div>

        {/* 3. TABLA DE DATOS */}
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-white text-gray-400 text-[10px] uppercase tracking-widest border-b border-gray-100">
                        <th className="p-5 font-bold text-center w-20">#</th>
                        <th className="p-5 font-bold">Nombre Provincia</th>
                        <th className="p-5 font-bold text-center">Municipios</th>
                        <th className="p-5 font-bold text-center">Recintos</th>
                        <th className="p-5 font-bold text-center w-48">Acciones</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-sm text-gray-600">
                    {provinciasData.map((prov, index) => (
                        <tr key={prov.id} className="hover:bg-red-50/30 transition-colors group">
                            <td className="p-5 text-center font-bold text-gray-300 group-hover:text-[#E31E24] transition-colors">
                                {index + 1}
                            </td>
                            <td className="p-5 font-bold text-gray-800 text-base">{prov.nombre}</td>
                            <td className="p-5 text-center">
                                <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 rounded-lg font-bold text-xs">
                                    {prov.municipios} Mun.
                                </span>
                            </td>
                            <td className="p-5 text-center font-bold text-gray-500">{prov.recintos}</td>
                            <td className="p-5 flex justify-center gap-2">
                                <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-all">
                                    Editar
                                </button>
                                <button className="px-4 py-2 bg-white border border-red-100 text-red-600 rounded-lg text-xs font-bold hover:bg-red-50 transition-all">
                                    Eliminar
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>

        {/* PAGINACIÓN */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center text-xs text-gray-500">
            <span className="font-medium">Mostrando 5 resultados</span>
            <div className="flex gap-2">
                <button className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50 font-bold text-gray-600">
                    Anterior
                </button>
                <button className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 font-bold text-gray-600">
                    Siguiente
                </button>
            </div>
        </div>

      </div>
    </div>
  );
};

export default Geografia;