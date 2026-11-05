import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bus, Search, Star, Bell, LogOut, MapPin, Clock, Smartphone, AlertTriangle, X } from 'lucide-react';

export default function DashboardUsuario() {
    const navigate = useNavigate();
    const [usuario, setUsuario] = useState(null);
    const [linhas, setLinhas] = useState([]);
    const [favoritos, setFavoritos] = useState([]);
    const [busca, setBusca] = useState('');
    const [filtroCidade, setFiltroCidade] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('');
    const [tempoAlerta, setTempoAlerta] = useState({});
    const [mensagemStatus, setMensagemStatus] = useState('');

    // Modal de Reportar Problema
    const [linhaProblema, setLinhaProblema] = useState(null);
    const [descricaoProblema, setDescricaoProblema] = useState('');
    const [enviandoProblema, setEnviandoProblema] = useState(false);

    useEffect(() => {
        const userStr = localStorage.getItem('usuario');
        const token = localStorage.getItem('token');

        if (!userStr) {
            navigate('/login');
            return;
        }

        setUsuario(JSON.parse(userStr));
        carregarLinhas(token);
    }, [navigate]);

    const carregarLinhas = async (token) => {
        try {
            const resposta = await fetch('https://localhost:7264/api/linhas', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (resposta.ok) {
                const dados = await resposta.json();
                setLinhas(dados);
            }
        } catch (erro) {
            console.error("Erro ao carregar linhas:", erro);
        }
    };

    const toggleFavorito = (id) => {
        if (favoritos.includes(id)) {
            setFavoritos(favoritos.filter(favId => favId !== id));
        } else {
            setFavoritos([...favoritos, id]);
        }
    };

    const ativarAlerta = (linha, minutos) => {
        setTempoAlerta({ ...tempoAlerta, [linha.id]: minutos });
        if ("vibrate" in navigator) {
            navigator.vibrate([500, 200, 500, 200, 1000]);
        }
        setMensagemStatus(`Alerta definido para ${linha.codigo} (${minutos} min antes).`);
        setTimeout(() => setMensagemStatus(''), 4000);
    };

    const handleEnviarProblema = async (e) => {
        e.preventDefault();
        if (!descricaoProblema.trim()) return;

        setEnviandoProblema(true);
        const token = localStorage.getItem('token');

        try {
            const resposta = await fetch('https://localhost:7264/api/ocorrencias', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    linhaId: linhaProblema.id,
                    linhaCodigo: linhaProblema.codigo,
                    linhaNome: linhaProblema.nome,
                    descricao: descricaoProblema
                })
            });

            if (resposta.ok) {
                setMensagemStatus(`Notificação enviada à administração sobre a linha ${linhaProblema.codigo}!`);
                setLinhaProblema(null);
                setDescricaoProblema('');
                setTimeout(() => setMensagemStatus(''), 5000);
            } else {
                alert("Erro ao enviar o alerta.");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setEnviandoProblema(false);
        }
    };

    const sair = () => {
        localStorage.clear();
        navigate('/login');
    };

    const linhasFiltradas = linhas.filter(l => {
        const termoBusca = busca.trim().toLowerCase();
        const termoCidade = filtroCidade.trim().toLowerCase();
        const termoEstado = filtroEstado.trim().toLowerCase();

        return (!termoBusca || l.nome?.toLowerCase().includes(termoBusca) || l.codigo?.toLowerCase().includes(termoBusca)) &&
            (!termoCidade || l.cidade?.toLowerCase().includes(termoCidade)) &&
            (!termoEstado || l.estado?.toLowerCase().includes(termoEstado));
    });

    if (!usuario) return null;

    return (
        <div className="min-h-screen bg-[#0B1120] text-slate-300 p-6 md:p-10 font-sans">

            {/* Cabeçalho */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-slate-800 pb-6 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Bus className="w-8 h-8 text-cyan-400" />
                        Consultar Horários de Autocarro
                    </h1>
                    <p className="text-slate-400 mt-1">
                        Passageiro: <span className="text-cyan-400 font-semibold">{usuario.nome}</span> ({usuario.cidade || 'Catanduva'} - {usuario.estado || 'SP'})
                    </p>
                </div>
                <button onClick={sair} className="flex items-center gap-2 bg-slate-800 hover:bg-red-900/40 text-slate-300 hover:text-red-400 px-4 py-2 rounded-lg transition">
                    <LogOut className="w-4 h-4" /> Sair
                </button>
            </header>

            {/* Notificação Status */}
            {mensagemStatus && (
                <div className="mb-6 bg-cyan-950/60 border border-cyan-500/50 p-4 rounded-xl text-cyan-300 flex items-center gap-3 animate-fade-in">
                    <Smartphone className="w-5 h-5 text-cyan-400 shrink-0" />
                    <p className="text-sm font-medium">{mensagemStatus}</p>
                </div>
            )}

            {/* Filtros */}
            <div className="bg-[#111827] border border-slate-800 p-6 rounded-2xl mb-8 shadow-xl">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <Search className="w-4 h-4 text-cyan-400" /> Pesquisar / Filtrar Transportes
                    </h2>
                    <span className="text-xs text-slate-500">
                        Exibindo {linhasFiltradas.length} de {linhas.length} linhas
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input type="text" placeholder="Pesquisar por linha ou código..." value={busca} onChange={(e) => setBusca(e.target.value)} className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-4 py-2.5 text-white outline-none focus:border-cyan-500" />
                    <input type="text" placeholder="Filtrar por Cidade..." value={filtroCidade} onChange={(e) => setFiltroCidade(e.target.value)} className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-4 py-2.5 text-white outline-none focus:border-cyan-500" />
                    <input type="text" placeholder="Filtrar por Estado (ex: SP)..." value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)} className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-4 py-2.5 text-white outline-none uppercase focus:border-cyan-500" />
                </div>
            </div>

            {/* Lista de Linhas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {linhasFiltradas.map((linha) => {
                    const isFavorito = favoritos.includes(linha.id);
                    const alertaAtual = tempoAlerta[linha.id];

                    return (
                        <div key={linha.id} className={`bg-[#111827] border rounded-2xl p-6 shadow-lg transition-all ${isFavorito ? 'border-amber-500/60 bg-amber-950/10' : 'border-slate-800'}`}>

                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <span className="bg-cyan-950 text-cyan-400 border border-cyan-800 text-xs px-2.5 py-1 rounded-md font-mono font-bold">
                                        {linha.codigo}
                                    </span>
                                    <h3 className="text-xl font-bold text-white mt-2">{linha.nome}</h3>
                                </div>

                                <button onClick={() => toggleFavorito(linha.id)} className="p-2 rounded-lg bg-slate-800/60 hover:bg-slate-700 transition">
                                    <Star className={`w-6 h-6 ${isFavorito ? 'text-amber-400 fill-amber-400' : 'text-slate-500'}`} />
                                </button>
                            </div>

                            <div className="space-y-2 mb-4 text-sm text-slate-400">
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-cyan-400" />
                                    <span>Próxima partida: <strong className="text-white">{linha.proximaPartida || '12:00'}</strong></span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-cyan-400" />
                                    <span>Local: <strong className="text-white">{linha.cidade ? `${linha.cidade} - ${linha.estado}` : 'Catanduva - SP'}</strong></span>
                                </div>
                            </div>

                            {/* Botões de Vibração e Reportar Problema */}
                            <div className="border-t border-slate-800/80 pt-4 mt-4 space-y-3">
                                <div>
                                    <p className="text-xs text-slate-400 mb-2 flex items-center gap-1 font-semibold">
                                        <Bell className="w-3.5 h-3.5 text-cyan-400" /> Lembrete com Vibração:
                                    </p>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button onClick={() => ativarAlerta(linha, 15)} className={`py-1.5 px-3 text-xs rounded-lg border ${alertaAtual === 15 ? 'bg-cyan-500 text-slate-900 font-bold' : 'bg-slate-800/50 border-slate-700'}`}>15 min</button>
                                        <button onClick={() => ativarAlerta(linha, 30)} className={`py-1.5 px-3 text-xs rounded-lg border ${alertaAtual === 30 ? 'bg-cyan-500 text-slate-900 font-bold' : 'bg-slate-800/50 border-slate-700'}`}>30 min</button>
                                    </div>
                                </div>

                                {/* BOTÃO REPORTAR PROBLEMA */}
                                <button
                                    onClick={() => setLinhaProblema(linha)}
                                    className="w-full bg-red-950/40 hover:bg-red-900/60 border border-red-800/60 text-red-400 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition"
                                >
                                    <AlertTriangle className="w-4 h-4" /> Relatar Problema na Linha
                                </button>
                            </div>

                        </div>
                    );
                })}
            </div>

            {/* MODAL REPORTAR PROBLEMA */}
            {linhaProblema && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-[#111827] border border-red-900/50 p-6 rounded-2xl max-w-md w-full shadow-2xl">
                        <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-3">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-red-500" />
                                Relatar Problema ({linhaProblema.codigo})
                            </h3>
                            <button onClick={() => setLinhaProblema(null)} className="text-slate-400 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleEnviarProblema} className="space-y-4">
                            <p className="text-xs text-slate-400">
                                A sua mensagem será enviada imediatamente ao Proprietário e Administrador.
                            </p>

                            <div>
                                <label className="text-xs uppercase font-semibold text-slate-400 block mb-1">Qual é o problema?</label>
                                <textarea
                                    required
                                    rows="3"
                                    placeholder="Ex: O autocarro está atrasado há mais de 20 minutos, lotação excessiva ou veículo com avaria."
                                    value={descricaoProblema}
                                    onChange={(e) => setDescricaoProblema(e.target.value)}
                                    className="w-full bg-[#0F172A] border border-slate-700 rounded-lg p-3 text-sm text-white focus:border-red-500 outline-none"
                                />
                            </div>

                            <div className="flex gap-3">
                                <button type="button" onClick={() => setLinhaProblema(null)} className="flex-1 bg-slate-800 text-slate-300 py-2.5 rounded-lg text-sm font-semibold">
                                    Cancelar
                                </button>
                                <button type="submit" disabled={enviandoProblema} className="flex-1 bg-red-600 hover:bg-red-500 text-white py-2.5 rounded-lg text-sm font-bold disabled:opacity-50">
                                    {enviandoProblema ? 'A enviar...' : 'Enviar Alerta'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}
