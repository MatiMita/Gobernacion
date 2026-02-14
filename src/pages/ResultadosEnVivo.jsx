import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    BarChart3,
    TrendingUp,
    Users,
    FileText,
    CheckCircle,
    RefreshCw,
    Trophy,
    Medal,
    ArrowLeft,
    Award,
    Users2,
    Building2,
    AlertCircle
} from 'lucide-react';

const ResultadosEnVivo = () => {
    const navigate = useNavigate();
    const [resultados, setResultados] = useState([]);
    const [cargos, setCargos] = useState({
        gobernador: [],
        asambleistaTerritorio: [],
        asambleistaPoblacion: []
    });
    const [resumen, setResumen] = useState({
        totalActas: 0,
        totalVotos: 0,
        actasValidadas: 0,
        votosNulos: 0,
        votosBlancos: 0,
        totalesPorCargo: {
            gobernador: 0,
            asambleistaTerritorio: 0,
            asambleistaPoblacion: 0
        }
    });
    const [cargoActivo, setCargoActivo] = useState('gobernador');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [ultimaActualizacion, setUltimaActualizacion] = useState(null);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

    const cargarResultados = async () => {
        try {
            setLoading(true);
            setError(null);
            
            console.log('Cargando resultados desde:', `${API_URL}/votos/resultados-vivo`);
            
            const response = await fetch(`${API_URL}/votos/resultados-vivo`);
            
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Datos recibidos:', data);

            if (data.success && data.data) {
                // Asegurar que resultados sea un array
                const resultadosArray = Array.isArray(data.data.resultados) ? data.data.resultados : [];
                setResultados(resultadosArray);
                
                // Separar resultados por tipo de cargo con valores por defecto
                const gobernador = resultadosArray.map(frente => ({
                    ...frente,
                    id_frente: frente.id_frente || 0,
                    nombre: frente.nombre || 'Sin nombre',
                    siglas: frente.siglas || 'S/N',
                    color: frente.color || '#1E3A8A',
                    votos: Number(frente.votos_gobernador) || 0
                })).sort((a, b) => b.votos - a.votos);

                const asambleistaTerritorio = resultadosArray.map(frente => ({
                    ...frente,
                    id_frente: frente.id_frente || 0,
                    nombre: frente.nombre || 'Sin nombre',
                    siglas: frente.siglas || 'S/N',
                    color: frente.color || '#1E3A8A',
                    votos: Number(frente.votos_asambleista_territorio) || 0
                })).sort((a, b) => b.votos - a.votos);

                const asambleistaPoblacion = resultadosArray.map(frente => ({
                    ...frente,
                    id_frente: frente.id_frente || 0,
                    nombre: frente.nombre || 'Sin nombre',
                    siglas: frente.siglas || 'S/N',
                    color: frente.color || '#1E3A8A',
                    votos: Number(frente.votos_asambleista_poblacion) || 0
                })).sort((a, b) => b.votos - a.votos);

                setCargos({
                    gobernador,
                    asambleistaTerritorio,
                    asambleistaPoblacion
                });
                
                // Establecer resumen con valores por defecto
                const resumenData = data.data.resumen || {};
                setResumen({
                    totalActas: Number(resumenData.totalActas) || 0,
                    totalVotos: Number(resumenData.totalVotos) || 0,
                    actasValidadas: Number(resumenData.actasValidadas) || 0,
                    votosNulos: Number(resumenData.votosNulos) || 0,
                    votosBlancos: Number(resumenData.votosBlancos) || 0,
                    totalesPorCargo: {
                        gobernador: Number(resumenData.totalesPorCargo?.gobernador) || 0,
                        asambleistaTerritorio: Number(resumenData.totalesPorCargo?.asambleistaTerritorio) || 0,
                        asambleistaPoblacion: Number(resumenData.totalesPorCargo?.asambleistaPoblacion) || 0
                    }
                });
                
                setUltimaActualizacion(new Date());
            } else {
                throw new Error('Estructura de datos incorrecta');
            }
        } catch (error) {
            console.error('Error al cargar resultados:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarResultados();
        const interval = setInterval(cargarResultados, 30000); // Aumentado a 30 segundos
        return () => clearInterval(interval);
    }, []);

    const calcularPorcentaje = (votos, total) => {
        if (!total || total === 0) return '0.00';
        return ((votos / total) * 100).toFixed(2);
    };

    const getResultadosActivos = () => {
        if (!cargos || !cargos[cargoActivo]) return [];
        return cargos[cargoActivo].filter(frente => frente && frente.votos > 0);
    };

    const getTotalVotosActivos = () => {
        const resultadosActivos = getResultadosActivos();
        return resultadosActivos.reduce((sum, r) => sum + (r.votos || 0), 0);
    };

    const getMaxVotosActivos = () => {
        const resultadosActivos = getResultadosActivos();
        return Math.max(...resultadosActivos.map(r => r.votos || 0), 1);
    };

    const getTituloCargo = () => {
        switch(cargoActivo) {
            case 'gobernador':
                return 'Votos para Gobernador(a)';
            case 'asambleistaTerritorio':
                return 'Votos para Asambleista por Territorio';
            case 'asambleistaPoblacion':
                return 'Votos para Asambleista por Población';
            default:
                return '';
        }
    };

    const getColorCargo = () => {
        switch(cargoActivo) {
            case 'gobernador':
                return '#1E3A8A';
            case 'asambleistaTerritorio':
                return '#F59E0B';
            case 'asambleistaPoblacion':
                return '#10B981';
            default:
                return '#1E3A8A';
        }
    };

    // Si hay error, mostrar mensaje
    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-red-50 border-l-4 border-red-500 rounded-2xl p-8 text-center">
                        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-red-700 mb-2">Error al cargar los datos</h2>
                        <p className="text-red-600 mb-4">{error}</p>
                        <button
                            onClick={cargarResultados}
                            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold transition"
                        >
                            Reintentar
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
            {/* Header con gradiente NGP */}
            <div className="max-w-7xl mx-auto mb-8">
                <div className="bg-gradient-to-r from-[#1E3A8A] to-[#152a63] rounded-3xl shadow-2xl p-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate('/')}
                                className="p-3 bg-white/20 hover:bg-white/30 backdrop-blur-lg rounded-xl transition"
                                title="Volver al inicio"
                            >
                                <ArrowLeft className="w-6 h-6 text-white" />
                            </button>
                            <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-lg">
                                <BarChart3 className="w-12 h-12 text-white" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-black text-white mb-2">
                                    Resultados en Vivo
                                </h1>
                                <p className="text-white/90 text-lg">
                                    Elecciones Subnacionales 2026 - Colcapirhua
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={cargarResultados}
                            disabled={loading}
                            className="flex items-center gap-2 bg-[#F59E0B] hover:bg-[#e68906] text-white px-6 py-3 rounded-xl font-bold transition shadow-lg"
                        >
                            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                            Actualizar
                        </button>
                    </div>

                    {ultimaActualizacion && (
                        <div className="mt-4 text-white/80 text-sm flex items-center gap-2">
                            <span className="w-2 h-2 bg-[#10B981] rounded-full animate-pulse"></span>
                            Última actualización: {ultimaActualizacion.toLocaleTimeString()}
                        </div>
                    )}
                </div>
            </div>

            {/* Estadísticas Rápidas */}
            <div className="max-w-7xl mx-auto mb-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-[#1E3A8A]">
                        <div className="flex items-center gap-3 mb-2">
                            <FileText className="w-6 h-6 text-[#1E3A8A]" />
                            <span className="text-gray-600 font-semibold">Actas Procesadas</span>
                        </div>
                        <p className="text-4xl font-black text-[#1E3A8A]">{resumen.totalActas}</p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-[#F59E0B]">
                        <div className="flex items-center gap-3 mb-2">
                            <Users className="w-6 h-6 text-[#F59E0B]" />
                            <span className="text-gray-600 font-semibold">Total Votos</span>
                        </div>
                        <p className="text-4xl font-black text-[#F59E0B]">{resumen.totalVotos.toLocaleString()}</p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-[#10B981]">
                        <div className="flex items-center gap-3 mb-2">
                            <CheckCircle className="w-6 h-6 text-[#10B981]" />
                            <span className="text-gray-600 font-semibold">Validadas</span>
                        </div>
                        <p className="text-4xl font-black text-[#10B981]">{resumen.actasValidadas}</p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-[#1E3A8A]">
                        <div className="flex items-center gap-3 mb-2">
                            <TrendingUp className="w-6 h-6 text-[#1E3A8A]" />
                            <span className="text-gray-600 font-semibold">Participación</span>
                        </div>
                        <p className="text-4xl font-black text-[#1E3A8A]">
                            {resumen.totalActas > 0 ? 
                                ((resumen.actasValidadas / resumen.totalActas) * 100).toFixed(1) : '0'}%
                        </p>
                    </div>
                </div>
            </div>

            {/* Selector de Cargos */}
            <div className="max-w-7xl mx-auto mb-6">
                <div className="bg-white rounded-2xl shadow-lg p-4">
                    <div className="flex flex-wrap gap-3 justify-center">
                        <button
                            onClick={() => setCargoActivo('gobernador')}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                                cargoActivo === 'gobernador'
                                    ? 'bg-[#1E3A8A] text-white shadow-lg scale-105'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            <Award className="w-5 h-5" />
                            Gobernador(a)
                            <span className="ml-2 px-2 py-1 bg-white/20 rounded-full text-sm">
                                {resumen.totalesPorCargo.gobernador.toLocaleString()}
                            </span>
                        </button>
                        <button
                            onClick={() => setCargoActivo('asambleistaTerritorio')}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                                cargoActivo === 'asambleistaTerritorio'
                                    ? 'bg-[#F59E0B] text-white shadow-lg scale-105'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            <Building2 className="w-5 h-5" />
                            Asambleista por Territorio
                            <span className="ml-2 px-2 py-1 bg-white/20 rounded-full text-sm">
                                {resumen.totalesPorCargo.asambleistaTerritorio.toLocaleString()}
                            </span>
                        </button>
                        <button
                            onClick={() => setCargoActivo('asambleistaPoblacion')}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                                cargoActivo === 'asambleistaPoblacion'
                                    ? 'bg-[#10B981] text-white shadow-lg scale-105'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            <Users2 className="w-5 h-5" />
                            Asambleista por Población
                            <span className="ml-2 px-2 py-1 bg-white/20 rounded-full text-sm">
                                {resumen.totalesPorCargo.asambleistaPoblacion.toLocaleString()}
                            </span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Resultados por Cargo */}
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-3xl shadow-2xl p-8">
                    <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
                        <Trophy className="w-8 h-8 text-[#F59E0B]" />
                        {getTituloCargo()}
                        <span className="ml-auto text-sm font-normal text-gray-500">
                            Total: {getTotalVotosActivos().toLocaleString()} votos
                        </span>
                    </h2>

                    {loading ? (
                        <div className="text-center py-12">
                            <RefreshCw className="w-12 h-12 text-[#1E3A8A] animate-spin mx-auto mb-4" />
                            <p className="text-gray-600">Cargando resultados...</p>
                        </div>
                    ) : getResultadosActivos().length === 0 ? (
                        <div className="text-center py-12">
                            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-600 text-lg">No hay resultados disponibles para este cargo</p>
                            <p className="text-gray-500 text-sm mt-2">
                                Los datos aparecerán cuando se registren las primeras actas
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {/* Gráfico de barras */}
                            <div className="bg-gray-50 rounded-2xl p-6 pt-14 border border-gray-200 overflow-visible">
                                <div className="flex items-end justify-center gap-10 overflow-x-auto pb-2">
                                    {getResultadosActivos().map((frente, index) => {
                                        const votos = frente.votos || 0;
                                        const totalActivo = getTotalVotosActivos();
                                        const porcentaje = calcularPorcentaje(votos, totalActivo);
                                        const maxVotos = getMaxVotosActivos();
                                        const barHeight = maxVotos > 0 ? (votos / maxVotos) * 100 : 0;
                                        const esGanador = index === 0;

                                        return (
                                            <div
                                                key={frente.id_frente}
                                                className="relative flex flex-col items-center min-w-[120px]"
                                                title={`${frente.siglas} - ${votos.toLocaleString()} votos`}
                                            >
                                                <div className="text-center mb-2">
                                                    <p className="text-sm font-black text-[#1E3A8A]">
                                                        {votos.toLocaleString()}
                                                    </p>
                                                    <p
                                                        className="text-xs font-bold"
                                                        style={{ color: frente.color || getColorCargo() }}
                                                    >
                                                        {porcentaje}%
                                                    </p>
                                                </div>

                                                <div className="w-full h-64 flex items-end justify-center">
                                                    <div className="relative w-12 h-full bg-gray-200 overflow-hidden rounded-t-lg">
                                                        <div
                                                            className="absolute bottom-0 left-0 right-0 transition-all duration-1000 ease-out"
                                                            style={{
                                                                height: `${barHeight}%`,
                                                                backgroundColor: frente.color || getColorCargo()
                                                            }}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="mt-3 text-center">
                                                    <p className="text-xs font-black text-[#1E3A8A]">{frente.siglas}</p>
                                                    <p className="text-[11px] text-gray-500 line-clamp-2">
                                                        {frente.nombre}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="mt-4 text-xs text-gray-500">
                                    Escala: La barra más alta representa {getMaxVotosActivos().toLocaleString()} votos.
                                </div>
                            </div>

                            {/* Tarjetas de resultados */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {getResultadosActivos().map((frente, index) => {
                                    const votos = frente.votos || 0;
                                    const totalActivo = getTotalVotosActivos();
                                    const porcentaje = calcularPorcentaje(votos, totalActivo);
                                    const esGanador = index === 0;

                                    return (
                                        <div
                                            key={frente.id_frente}
                                            className={`relative border-2 rounded-2xl p-6 transition-all hover:shadow-lg ${
                                                esGanador
                                                    ? 'border-[#F59E0B] bg-[#F59E0B] bg-opacity-5'
                                                    : 'border-gray-200 bg-white hover:border-[#1E3A8A]'
                                            }`}
                                        >
                                            {esGanador && (
                                                <div className="absolute -top-3 -right-3 bg-[#F59E0B] text-white p-2 rounded-full shadow-lg">
                                                    <Medal className="w-6 h-6" />
                                                </div>
                                            )}

                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div
                                                        className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg"
                                                        style={{ backgroundColor: frente.color || getColorCargo() }}
                                                    >
                                                        {index + 1}
                                                    </div>
                                                    <div>
                                                        <h3 className="text-xl font-bold text-[#1E3A8A] mb-1">
                                                            {frente.siglas}
                                                        </h3>
                                                        <p className="text-sm text-gray-600">{frente.nombre}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-3xl font-black text-[#1E3A8A] mb-1">
                                                        {votos.toLocaleString()}
                                                    </p>
                                                    <p className="text-lg font-bold" style={{ color: frente.color || getColorCargo() }}>
                                                        {porcentaje}%
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Votos Nulos y Blancos */}
                    {(resumen.votosNulos > 0 || resumen.votosBlancos > 0) && (
                        <div className="grid grid-cols-2 gap-6 mt-8 pt-8 border-t-2 border-gray-200">
                            <div className="bg-red-50 rounded-xl p-6 border border-red-200">
                                <h4 className="text-red-700 font-semibold mb-2 flex items-center gap-2">
                                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                                    Votos Nulos
                                </h4>
                                <p className="text-3xl font-black text-red-700">
                                    {resumen.votosNulos.toLocaleString()}
                                </p>
                                <p className="text-sm text-red-600 mt-1">
                                    {calcularPorcentaje(resumen.votosNulos, resumen.totalVotos)}% del total
                                </p>
                            </div>
                            <div className="bg-[#F59E0B] bg-opacity-5 rounded-xl p-6 border border-[#F59E0B] border-opacity-30">
                                <h4 className="text-[#F59E0B] font-semibold mb-2 flex items-center gap-2">
                                    <span className="w-2 h-2 bg-[#F59E0B] rounded-full"></span>
                                    Votos Blancos
                                </h4>
                                <p className="text-3xl font-black text-[#F59E0B]">
                                    {resumen.votosBlancos.toLocaleString()}
                                </p>
                                <p className="text-sm text-[#F59E0B] mt-1">
                                    {calcularPorcentaje(resumen.votosBlancos, resumen.totalVotos)}% del total
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ResultadosEnVivo;