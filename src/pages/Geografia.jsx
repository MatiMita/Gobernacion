import React, { useState, useEffect } from 'react';
import { Map, MapPin, Plus, Search, Edit, Trash2, X } from 'lucide-react';

const Geografia = () => {
    const [registros, setRegistros] = useState([]);
    const [registrosFiltrados, setRegistrosFiltrados] = useState([]);
    const [padres, setPadres] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modalAbierto, setModalAbierto] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [guardando, setGuardando] = useState(false);
    const [busqueda, setBusqueda] = useState('');
    const [filtroTipo, setFiltroTipo] = useState('');

    const [nuevoRegistro, setNuevoRegistro] = useState({
        nombre: '',
        codigo: '',
        ubicacion: '',
        tipo: '',
        fk_id_geografico: ''
    });

    const API_URL = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem('token');

    const cargarRegistros = async () => {
        try {
            const response = await fetch(`${API_URL}/geografico`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (data.success) {
                setRegistros(data.data);
                setRegistrosFiltrados(data.data);
            }

        } catch (err) {
            console.error("Error:", err);
            setError("No se pudieron cargar los registros: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const cargarPadres = async () => {
        try {
            const response = await fetch(`${API_URL}/geografico/padres`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (data.success) {
                setPadres(data.data);
            }

        } catch (err) {
            console.error("Error al cargar padres:", err);
        }
    };

    useEffect(() => {
        cargarRegistros();
        cargarPadres();
    }, []);

    // Filtrar registros
    useEffect(() => {
        let resultado = registros;

        if (busqueda) {
            resultado = resultado.filter(r =>
                r.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
                r.codigo?.toLowerCase().includes(busqueda.toLowerCase())
            );
        }

        if (filtroTipo) {
            resultado = resultado.filter(r => r.tipo === filtroTipo);
        }

        setRegistrosFiltrados(resultado);
    }, [busqueda, filtroTipo, registros]);

    const abrirModal = (registro = null) => {
        if (registro) {
            setModoEdicion(true);
            setNuevoRegistro({
                id_geografico: registro.id_geografico,
                nombre: registro.nombre,
                codigo: registro.codigo || '',
                ubicacion: registro.ubicacion || '',
                tipo: registro.tipo,
                fk_id_geografico: registro.fk_id_geografico || ''
            });
        } else {
            setModoEdicion(false);
            setNuevoRegistro({
                nombre: '',
                codigo: '',
                ubicacion: '',
                tipo: '',
                fk_id_geografico: ''
            });
        }
        setModalAbierto(true);
        setError(null);
    };

    const cerrarModal = () => {
        setModalAbierto(false);
        setError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setGuardando(true);
        setError(null);

        try {
            const url = modoEdicion
                ? `${API_URL}/geografico/${nuevoRegistro.id_geografico}`
                : `${API_URL}/geografico`;

            const method = modoEdicion ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    nombre: nuevoRegistro.nombre,
                    codigo: nuevoRegistro.codigo || null,
                    ubicacion: nuevoRegistro.ubicacion || null,
                    tipo: nuevoRegistro.tipo,
                    fk_id_geografico: nuevoRegistro.fk_id_geografico || null
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error al guardar');
            }

            if (data.success) {
                await cargarRegistros();
                await cargarPadres();
                cerrarModal();
                alert(modoEdicion ? '✅ Registro actualizado' : '✅ Registro creado');
            }

        } catch (err) {
            setError(err.message);
        } finally {
            setGuardando(false);
        }
    };

    const handleEliminar = async (id, nombre) => {
        if (!confirm(`¿Estás seguro de eliminar "${nombre}"?`)) return;

        try {
            const response = await fetch(`${API_URL}/geografico/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error al eliminar');
            }

            if (data.success) {
                await cargarRegistros();
                await cargarPadres();
                alert('✅ Registro eliminado');
            }

        } catch (err) {
            alert('❌ ' + err.message);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNuevoRegistro(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Obtener tipos únicos
    const tiposUnicos = [...new Set(registros.map(r => r.tipo).filter(Boolean))];

    return (
        <div className="p-6 min-h-screen bg-gray-50 font-sans">

            {/* HEADER */}
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

                <button
                    onClick={() => abrirModal()}
                    className="bg-gray-900 hover:bg-gray-800 text-white px-5 py-3 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg transition-all transform hover:-translate-y-0.5"
                >
                    <Plus size={18} />
                    Nuevo Registro
                </button>
            </div>

            {/* TARJETA DE CONTENIDO */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

                {/* FILTROS Y BUSCADOR */}
                <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row gap-4 items-end">

                    {/* Filtro Tipo */}
                    <div className="w-full md:w-64">
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">
                            Filtrar por Tipo
                        </label>
                        <div className="relative group">
                            <select
                                value={filtroTipo}
                                onChange={(e) => setFiltroTipo(e.target.value)}
                                className="w-full pl-4 pr-10 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 font-bold focus:ring-2 focus:ring-red-100 focus:border-[#E31E24] outline-none appearance-none transition-all cursor-pointer hover:border-gray-300"
                            >
                                <option value="">Todos los tipos</option>
                                {tiposUnicos.map(tipo => (
                                    <option key={tipo} value={tipo}>{tipo}</option>
                                ))}
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-[#E31E24] transition-colors">
                                <MapPin size={18} />
                            </div>
                        </div>
                    </div>

                    {/* Buscador */}
                    <div className="flex-1 w-full">
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">
                            Buscar
                        </label>
                        <div className="relative group">
                            <input
                                type="text"
                                placeholder="Buscar por nombre o código..."
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 font-medium focus:ring-2 focus:ring-red-100 focus:border-[#E31E24] outline-none transition-all placeholder:text-gray-400"
                            />
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-focus-within:text-[#E31E24] transition-colors">
                                <Search size={18} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* TABLA DE DATOS */}
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="p-10 text-center text-gray-500">Cargando...</div>
                    ) : error && registros.length === 0 ? (
                        <div className="p-10 text-center text-red-500">{error}</div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white text-gray-400 text-[10px] uppercase tracking-widest border-b border-gray-100">
                                    <th className="p-5 font-bold text-center w-20">#</th>
                                    <th className="p-5 font-bold">Nombre</th>
                                    <th className="p-5 font-bold">Código</th>
                                    <th className="p-5 font-bold">Tipo</th>
                                    <th className="p-5 font-bold">Padre</th>
                                    <th className="p-5 font-bold text-center w-48">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 text-sm text-gray-600">
                                {registrosFiltrados.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="p-10 text-center text-gray-400">
                                            No se encontraron registros
                                        </td>
                                    </tr>
                                ) : (
                                    registrosFiltrados.map((reg, index) => (
                                        <tr key={reg.id_geografico} className="hover:bg-red-50/30 transition-colors group">
                                            <td className="p-5 text-center font-bold text-gray-300 group-hover:text-[#E31E24] transition-colors">
                                                {index + 1}
                                            </td>
                                            <td className="p-5 font-bold text-gray-800 text-base">{reg.nombre}</td>
                                            <td className="p-5 text-gray-600">{reg.codigo || '-'}</td>
                                            <td className="p-5">
                                                <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 rounded-lg font-bold text-xs">
                                                    {reg.tipo}
                                                </span>
                                            </td>
                                            <td className="p-5 text-gray-500 text-xs">{reg.nombre_padre || 'Sin padre'}</td>
                                            <td className="p-5 flex justify-center gap-2">
                                                <button
                                                    onClick={() => abrirModal(reg)}
                                                    className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-all flex items-center gap-1"
                                                >
                                                    <Edit size={14} /> Editar
                                                </button>
                                                <button
                                                    onClick={() => handleEliminar(reg.id_geografico, reg.nombre)}
                                                    className="px-4 py-2 bg-white border border-red-100 text-red-600 rounded-lg text-xs font-bold hover:bg-red-50 transition-all flex items-center gap-1"
                                                >
                                                    <Trash2 size={14} /> Eliminar
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* FOOTER */}
                <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center text-xs text-gray-500">
                    <span className="font-medium">
                        Mostrando {registrosFiltrados.length} de {registros.length} registros
                    </span>
                </div>

            </div>

            {/* MODAL CREAR/EDITAR */}
            {modalAbierto && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

                        {/* Header del Modal */}
                        <div className="sticky top-0 bg-gray-900 text-white px-6 py-4 flex justify-between items-center rounded-t-2xl">
                            <h2 className="text-xl font-bold">
                                {modoEdicion ? 'Editar Registro' : 'Nuevo Registro Geográfico'}
                            </h2>
                            <button onClick={cerrarModal} className="hover:bg-gray-800 p-2 rounded-full transition">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Formulario */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-6">

                            {/* Error */}
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                    {error}
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                        Nombre *
                                    </label>
                                    <input
                                        type="text"
                                        name="nombre"
                                        value={nuevoRegistro.nombre}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                                        placeholder="Ej: Cercado"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                        Código
                                    </label>
                                    <input
                                        type="text"
                                        name="codigo"
                                        value={nuevoRegistro.codigo}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                                        placeholder="Ej: CBBA-CER"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                        Tipo *
                                    </label>
                                    <input
                                        type="text"
                                        name="tipo"
                                        value={nuevoRegistro.tipo}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                                        placeholder="Ej: Provincia, Municipio, Distrito"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                        Ubicación
                                    </label>
                                    <input
                                        type="text"
                                        name="ubicacion"
                                        value={nuevoRegistro.ubicacion}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                                        placeholder="Ej: Centro de Cochabamba"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                        Padre (Jerarquía)
                                    </label>
                                    <select
                                        name="fk_id_geografico"
                                        value={nuevoRegistro.fk_id_geografico}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                                    >
                                        <option value="">Sin padre (nivel superior)</option>
                                        {padres
                                            .filter(p => p.id_geografico !== nuevoRegistro.id_geografico)
                                            .map(padre => (
                                                <option key={padre.id_geografico} value={padre.id_geografico}>
                                                    {padre.nombre} ({padre.tipo})
                                                </option>
                                            ))
                                        }
                                    </select>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Selecciona el registro padre si este es un nivel inferior (ej: un municipio dentro de una provincia)
                                    </p>
                                </div>
                            </div>

                            {/* Botones */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={cerrarModal}
                                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={guardando}
                                    className="flex-1 px-6 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {guardando ? 'Guardando...' : (modoEdicion ? 'Actualizar' : 'Crear')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Geografia;