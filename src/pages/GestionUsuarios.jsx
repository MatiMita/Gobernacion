import React, { useState } from 'react';

const GestionUsuarios = () => {
  
  const [usuarios] = useState([
    { 
      id_usuario: 1, 
      nombre_usuario: "admin_cami", 
      activo: 1, 
      persona: { nombre: "Camila", apellido_paterno: "Gonzales", apellido_materno: "", ci: "5422112", email: "camila@umss.edu" },
      rol: "Administrador" 
    },
    { 
      id_usuario: 2, 
      nombre_usuario: "matias_dev", 
      activo: 1, 
      persona: { nombre: "Matiass", apellido_paterno: "Scrum", apellido_materno: "Master", ci: "8877665", email: "matias@umss.edu" },
      rol: "Jurado"
    },
    { 
      id_usuario: 3, 
      nombre_usuario: "belen_v", 
      activo: 0, 
      persona: { nombre: "Belén", apellido_paterno: "Vargas", apellido_materno: "López", ci: "9988776", email: "belen@umss.edu" },
      rol: "Votante"
    }
  ]);

 
  const getIniciales = (nombre, apellido) => {
    return `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase();
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen font-sans">
      
      {/* 1. ENCABEZADO: Título  */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
            <span className="w-2 h-8 bg-red-600 rounded-full"></span> 
            Directorio de Usuarios
          </h1>
          <p className="text-gray-500 mt-1 text-sm ml-4">
            Gestión de accesos para la campaña <span className="font-bold text-red-600">UNIDOS</span>.
          </p>
        </div>
        
        <div className="flex gap-3">
            <input 
              type="text" 
              placeholder="Buscar usuario..." 
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm w-64 shadow-sm"
            />
            
            <button className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-2 rounded-lg shadow-md transition-all flex items-center gap-2">
              <span>+</span> Crear Usuario
            </button>
        </div>
      </div>

      
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Usuario</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Documento & Contacto</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Rol</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Estado</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {usuarios.map((usuario) => (
              <tr key={usuario.id_usuario} className="hover:bg-red-50/20 transition duration-150 group">
                
                {/* Avatar con Iniciales */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                      {getIniciales(usuario.persona.nombre, usuario.persona.apellido_paterno)}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">
                        {usuario.persona.nombre} {usuario.persona.apellido_paterno}
                      </div>
                      <div className="text-xs text-gray-400 font-mono mt-0.5">
                        @{usuario.nombre_usuario}
                      </div>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4">
                    <div className="flex flex-col">
                        <span className="text-sm text-gray-800 font-medium">CI: {usuario.persona.ci}</span>
                        <span className="text-xs text-gray-500">{usuario.persona.email}</span>
                    </div>
                </td>

                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded border text-xs font-bold
                    ${usuario.rol === 'Administrador' ? 'bg-gray-800 text-white border-gray-700' : 
                      usuario.rol === 'Jurado' ? 'bg-red-100 text-red-800 border-red-200' : 
                      'bg-gray-100 text-gray-600 border-gray-200'}`}>
                    {usuario.rol}
                  </span>
                </td>

                <td className="px-6 py-4 text-center">
                   <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase
                    ${usuario.activo === 1 ? 'bg-green-100 text-green-700' : 'bg-red-50 text-red-500'}`}>
                    <span className={`h-2 w-2 rounded-full ${usuario.activo === 1 ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    {usuario.activo === 1 ? 'Activo' : 'Baja'}
                   </div>
                </td>

                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                    <button className="text-gray-400 hover:text-red-600 font-semibold text-xs px-2 py-1 hover:bg-red-50 rounded">EDITAR</button>
                    <button className="text-gray-400 hover:text-gray-800 font-semibold text-xs px-2 py-1 hover:bg-gray-100 rounded">BORRAR</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GestionUsuarios;