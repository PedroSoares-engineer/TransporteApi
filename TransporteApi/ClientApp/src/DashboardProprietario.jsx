import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bus, Users, ShieldCheck, MapPin, Search, LogOut, Clock, Activity, AlertCircle, AlertTriangle, Mail, CheckCircle } from 'lucide-react';

export default function DashboardProprietario() {
    const navigate = useNavigate();
    const [usuario, setUsuario] = useState(null);
    const [estatisticas, setEstatisticas] = useState({
        totalUsuarios: 0,
        totalAdmins: 0,
        totalLinhas: 0
    });
    const [linhas, setLinhas] = useState([]);
    const [ocorrencias, setOcorrencias] = useState([]);
    const [listaUsuarios, setListaUsuarios] = useState([]); // NOVO: Para guardar os nomes
    const [busca, setBusca] = useState('');
    const [filtroCidade, setFiltroCidade] = useState('');

    useEffect(() => {
        const userStr = localStorage.getItem('usuario');
        const token = localStorage.getItem('token');

        if (!userStr || !token) {
            navigate('/login');
            return;
        }

        const user = JSON.parse(userStr);
        if (user.regra !== 'Proprietario') {
            alert('Acesso restrito ao Proprietário do sistema.');
            navigate('/login');
            return;
        }

        setUsuario(user);
        carregarDados(token);
    }, [navigate]);

    const carregarDados = async (token) => {
        try {
            // 1. Carregar Estatísticas Gerais
            const resStats = await fetch('https://localhost:7264/api/estatisticas', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (resStats.ok) {
                const dataStats = await resStats.json();
                setEstatisticas(dataStats);
            }

            // 2. Carregar Lista Detalhada de Linhas
            const resLinhas = await fetch('https://localhost:7264/api/linhas', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (resLinhas.ok) {
                const dataLinhas = await resLinhas.json();
                setLinhas(dataLinhas);
            }

            // 3. Carregar Ocorrências
            carregarOcorrencias(token);

            // 4. Carregar Lista de Nomes de Usuários (NOVO)
            const resUsuarios = await fetch('https://localhost:7264/api/usuario/todos', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (resUsuarios.ok) {
                const dataUsuarios = await resUsuarios.json();
                setListaUsuarios(dataUsuarios);
            }
        } catch (erro) {
            console.error("Erro ao carregar dados do painel do proprietário:", erro);
        }
    };

    const carregarOcorrencias = async (token) => {
        try {
            const res = await fetch('https://localhost:7264/api/ocorrencias', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const dados = await res.json();
                setOcorrencias(dados);
            }
        } catch (err) {
            console.error("Erro ao carregar ocorrências:", err);
        }
    };

    // ATUALIZADO: Função que pede a mensagem e envia para a API
    const handleResolverOcorrencia = async (id) => {
        const mensagem = window.prompt("Digite a resposta da equipa para enviar ao passageiro:");
        if (mensagem === null) return; // Cancela se o dono clicar em cancelar

        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`https://localhost:7264/api/ocorrencias/${id}/resolver?mensagem=${encodeURIComponent(mensagem)}`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                carregarOcorrencias(token);
            }
        } catch (err) {
            console.error("Erro ao resolver ocorrência:", err);
        }
    };

    const sair = () => {
        localStorage.clear();
        navigate('/login');
    };

    // Calcula dinamicamente o número total de cidades atendidas
    const cidadesUnicas = [...new Set(linhas.map(l => l.cidade?.trim().toLowerCase()).filter(Boolean))].length;

    // Filtro de busca de linhas para o Proprietário
    const linhasFiltradas = linhas.filter(l => {
        const termoBusca = busca.trim().toLowerCase();
        const termoCidade = filtroCidade.trim().toLowerCase();

        const atendeBusca = !termoBusca ||
            l.nome?.toLowerCase().includes(termoBusca) ||
            l.codigo?.toLowerCase().includes(termoBusca);

        const atendeCidade = !termoCidade ||
            l.cidade?.toLowerCase().includes(termoCidade) ||
            l.estado?.toLowerCase().includes(termoCidade);

        return atendeBusca && atendeCidade;
    });

    if (!usuario) return null;

    // Separa os utilizadores para listar os nomes
    const admins = listaUsuarios.filter(u => u.regra === 'Admin');
    const clientes = listaUsuarios.filter(u => u.regra === 'Comum' || u.regra === 'Cliente');

    return (
        <div className="min-h-screen bg-[#0B1120] text-slate-300 p-6 md:p-10 font-sans">

            {/* Cabeçalho */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-slate-800 pb-6 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <ShieldCheck className="w-8 h-8 text-cyan-400" />
                        Painel do Proprietário
                    </h1>
                    <p className="text-slate-400 mt-1">
                        Bem-vindo, <span className="text-cyan-400 font-semibold">{usuario.nome}</span> (Acesso Executivo / VIP)
                    </p>
                </div>
                <button onClick={sair} className="flex items-center gap-2 bg-slate-800 hover:bg-red-900/40 text-slate-300 hover:text-red-400 px-4 py-2 rounded-lg transition">
                    <LogOut className="w-4 h-4" /> Terminar Sessão
                </button>
            </header>

            {/* Cartões Executivos de Resumo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">

                <div className="bg-[#111827] border border-slate-800 p-6 rounded-2xl border-t-4 border-t-purple-500 shadow-xl">
                    <div className="flex justify-between items-center mb-2">
                        <p className="text-xs uppercase font-semibold text-slate-400">Total de Utilizadores</p>
                        <Users className="w-6 h-6 text-purple-400" />
                    </div>
                    <h2 className="text-3xl font-bold text-white">{estatisticas.totalUsuarios}</h2>
                    <span className="text-xs text-emerald-400 mt-2 block font-mono">✓ Ligação SQLite Ativa</span>
                </div>

                <div className="bg-[#111827] border border-slate-800 p-6 rounded-2xl border-t-4 border-t-amber-500 shadow-xl">
                    <div className="flex justify-between items-center mb-2">
                        <p className="text-xs uppercase font-semibold text-slate-400">Administradores</p>
                        <ShieldCheck className="w-6 h-6 text-amber-400" />
                    </div>
                    <h2 className="text-3xl font-bold text-white">{estatisticas.totalAdmins}</h2>
                    <span className="text-xs text-slate-500 mt-2 block">Gestores operacionais</span>
                </div>

                <div className="bg-[#111827] border border-slate-800 p-6 rounded-2xl border-t-4 border-t-cyan-500 shadow-xl">
                    <div className="flex justify-between items-center mb-2">
                        <p className="text-xs uppercase font-semibold text-slate-400">Linhas Registadas</p>
                        <Bus className="w-6 h-6 text-cyan-400" />
                    </div>
                    <h2 className="text-3xl font-bold text-white">{linhas.length}</h2>
                    <span className="text-xs text-cyan-400 mt-2 block">Ativas em tempo real</span>
                </div>

                <div className="bg-[#111827] border border-slate-800 p-6 rounded-2xl border-t-4 border-t-emerald-500 shadow-xl">
                    <div className="flex justify-between items-center mb-2">
                        <p className="text-xs uppercase font-semibold text-slate-400">Cidades Atendidas</p>
                        <MapPin className="w-6 h-6 text-emerald-400" />
                    </div>
                    <h2 className="text-3xl font-bold text-white">{cidadesUnicas}</h2>
                    <span className="text-xs text-emerald-400 mt-2 block">Cobertura da frota</span>
                </div>
            </div>

            {/* NOVO: Lista de Nomes (Equipa e Passageiros) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                <div className="bg-[#111827] border border-slate-800 p-5 rounded-2xl shadow-xl">
                    <h3 className="text-sm uppercase font-bold text-amber-400 mb-3 flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> Equipa Técnica (Admins)</h3>
                    <div className="bg-slate-900/50 p-3 rounded-lg max-h-32 overflow-y-auto">
                        {admins.length === 0 ? <p className="text-xs text-slate-500">Nenhum admin registado.</p> : (
                            <ul className="space-y-1">
                                {admins.map(a => <li key={a.id} className="text-sm text-slate-300 flex items-center gap-2">• {a.nome}</li>)}
                            </ul>
                        )}
                    </div>
                </div>

                <div className="bg-[#111827] border border-slate-800 p-5 rounded-2xl shadow-xl">
                    <h3 className="text-sm uppercase font-bold text-purple-400 mb-3 flex items-center gap-2"><Users className="w-4 h-4" /> Passageiros (Usuários Comuns)</h3>
                    <div className="bg-slate-900/50 p-3 rounded-lg max-h-32 overflow-y-auto">
                        {clientes.length === 0 ? <p className="text-xs text-slate-500">Nenhum passageiro registado.</p> : (
                            <ul className="space-y-1">
                                {clientes.map(c => <li key={c.id} className="text-sm text-slate-300 flex items-center gap-2">• {c.nome}</li>)}
                            </ul>
                        )}
                    </div>
                </div>
            </div>

            {/* PAINEL DE NOTIFICAÇÕES E OCORRÊNCIAS DOS PASSAGEIROS */}
            <div className="bg-[#111827] border border-slate-800 p-6 rounded-2xl mb-10 shadow-xl">
                <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-4">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-500 animate-pulse" />
                        Alertas de Problemas Enviados por Passageiros
                        {ocorrencias.filter(o => !o.resolvido).length > 0 && (
                            <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                                {ocorrencias.filter(o => !o.resolvido).length} novos
                            </span>
                        )}
                    </h2>
                    <span className="text-xs text-slate-500 italic hidden md:block">Ocorrências resolvidas apagam automaticamente em 10 min</span>
                </div>

                <div className="space-y-3 max-h-80 overflow-y-auto">
                    {ocorrencias.length === 0 ? (
                        <p className="text-slate-500 text-sm italic">Nenhum problema reportado até ao momento.</p>
                    ) : (
                        ocorrencias.map((item) => (
                            <div key={item.id} className={`p-4 rounded-xl border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${item.resolvido ? 'bg-slate-900/40 border-slate-800 opacity-60' : 'bg-red-950/20 border-red-900/60'}`}>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="bg-red-950 text-red-400 border border-red-800 text-xs px-2 py-0.5 rounded font-mono font-bold">
                                            {item.linhaCodigo}
                                        </span>
                                        <strong className="text-white text-sm">{item.linhaNome}</strong>
                                        <span className="text-xs text-slate-500">• {new Date(item.dataHora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <p className="text-sm text-slate-300 mt-1 whitespace-pre-wrap">"{item.descricao}"</p>
                                    <p className="text-xs text-slate-500 mt-1">Enviado por: <span className="text-slate-400 font-semibold">{item.usuarioNome}</span></p>
                                </div>

                                {!item.resolvido ? (
                                    <button
                                        onClick={() => handleResolverOcorrencia(item.id)}
                                        className="bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-800 text-emerald-400 text-xs px-4 py-2.5 rounded-lg font-bold transition flex items-center gap-2"
                                    >
                                        <Mail className="w-4 h-4" /> Responder e Resolver
                                    </button>
                                ) : (
                                    <div className="flex items-center gap-2 text-emerald-500 font-bold bg-emerald-950/30 px-4 py-2 rounded-lg border border-emerald-900/50">
                                        <CheckCircle className="w-4 h-4" />
                                        Resolvido
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* SEÇÃO DETALHADA DAS LINHAS PARA O PROPRIETÁRIO */}
            <div className="bg-[#111827] border border-slate-800 p-6 rounded-2xl shadow-xl mb-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Activity className="w-5 h-5 text-cyan-400" /> Visão Detalhada das Linhas e Frotas
                        </h2>
                        <p className="text-xs text-slate-400 mt-1">Monitorização operacional completa enviada via API Protegida (JWT)</p>
                    </div>

                    <div className="flex flex-wrap gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                            <input
                                type="text"
                                placeholder="Buscar por código ou nome..."
                                value={busca}
                                onChange={(e) => setBusca(e.target.value)}
                                className="w-full bg-[#0F172A] border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white focus:border-cyan-500 outline-none"
                            />
                        </div>

                        <div className="relative flex-1 md:w-48">
                            <MapPin className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                            <input
                                type="text"
                                placeholder="Filtrar por Cidade..."
                                value={filtroCidade}
                                onChange={(e) => setFiltroCidade(e.target.value)}
                                className="w-full bg-[#0F172A] border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white focus:border-cyan-500 outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Tabela Executiva Detalhada */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-800 text-xs font-semibold uppercase text-slate-400 bg-[#0F172A]">
                                <th className="p-4">Código</th>
                                <th className="p-4">Nome da Linha</th>
                                <th className="p-4">Localização (Cidade/Estado)</th>
                                <th className="p-4">Próxima Partida</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Lotação Atual</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 text-sm">
                            {linhasFiltradas.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-slate-500 italic">
                                        Nenhuma linha encontrada para exibição.
                                    </td>
                                </tr>
                            ) : (
                                linhasFiltradas.map((linha) => (
                                    <tr key={linha.id} className="hover:bg-slate-800/30 transition">
                                        <td className="p-4">
                                            <span className="bg-cyan-950 text-cyan-400 border border-cyan-800 text-xs px-2.5 py-1 rounded-md font-mono font-bold">
                                                {linha.codigo}
                                            </span>
                                        </td>
                                        <td className="p-4 font-bold text-white">{linha.nome}</td>
                                        <td className="p-4 text-slate-300">
                                            <div className="flex items-center gap-1.5">
                                                <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                                                {linha.cidade ? `${linha.cidade} - ${linha.estado}` : 'Catanduva - SP'}
                                            </div>
                                        </td>
                                        <td className="p-4 text-slate-300">
                                            <div className="flex items-center gap-1.5">
                                                <Clock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                                                {/* Oculta horário para Ruas/Rodovias também aqui na tabela */}
                                                {['Ruas/Avenidas', 'Rodovias', 'Vicinais'].includes(linha.nome) ? '--:--' : (linha.proximaPartida || '12:00')}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${linha.status === 'Atrasado'
                                                ? 'bg-amber-950/80 text-amber-400 border border-amber-800'
                                                : 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                                                }`}>
                                                <AlertCircle className="w-3 h-3" />
                                                {linha.status || 'No horário'}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="w-full max-w-[140px]">
                                                <div className="flex justify-between text-xs mb-1">
                                                    <span className="text-slate-400 font-semibold">{linha.lotacao || 50}%</span>
                                                    <span className={linha.lotacao >= 75 ? 'text-amber-400 font-bold' : 'text-slate-500'}>
                                                        {linha.lotacao >= 75 ? 'Alta' : 'Normal'}
                                                    </span>
                                                </div>
                                                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${linha.lotacao >= 75 ? 'bg-amber-500' : 'bg-cyan-500'}`}
                                                        style={{ width: `${linha.lotacao || 50}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
}

