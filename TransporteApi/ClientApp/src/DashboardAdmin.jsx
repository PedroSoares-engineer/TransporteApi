import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bus, Clock, AlertTriangle, PlusCircle, Trash2, LogOut, MapPin, Search } from 'lucide-react';
import { API_URL } from './config.js';

export default function DashboardAdmin() {
    const navigate = useNavigate();
    const [usuario, setUsuario] = useState(null);
    const [linhas, setLinhas] = useState([]);
    const [ocorrencias, setOcorrencias] = useState([]);
    const [busca, setBusca] = useState('');

    const [novaLinha, setNovaLinha] = useState({
        nome: '',
        codigo: '',
        status: 'Fluxo normal',
        proximaPartida: '12:00',
        lotacao: 50,
        cidade: '',
        estado: ''
    });

    useEffect(() => {
        const userStr = localStorage.getItem('usuario');
        const token = localStorage.getItem('token');

        if (!userStr || !token) {
            navigate('/login');
            return;
        }

        const user = JSON.parse(userStr);
        if (user.regra !== 'Admin' && user.regra !== 'Proprietario') {
            alert('Acesso negado: Perfil sem permissões administrativas.');
            navigate('/login');
            return;
        }

        setUsuario(user);
        carregarLinhas(token);
        carregarOcorrencias(token);
    }, [navigate]);

    const carregarLinhas = async (token) => {
        try {
            const resposta = await fetch(`${API_URL}/api/linhas`, {
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

    const carregarOcorrencias = async (token) => {
        try {
            const res = await fetch(`${API_URL}/api/ocorrencias`, {
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

    const handleResolverOcorrencia = async (id) => {
        const token = localStorage.getItem('token');
        try {
            const mensagem = window.prompt("Digite a resposta da equipa para o passageiro:") ?? "";
            const res = await fetch(`${API_URL}/api/ocorrencias/${id}/resolver?mensagem=${encodeURIComponent(mensagem)}`, {
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

    const handleCadastrarLinha = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');

        try {
            const resposta = await fetch(`${API_URL}/api/linhas`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(novaLinha)
            });

            if (resposta.ok) {
                alert('Linha / Via cadastrada com sucesso!');
                setNovaLinha({
                    nome: '',
                    codigo: '',
                    status: 'Fluxo normal',
                    proximaPartida: '12:00',
                    lotacao: 50,
                    cidade: '',
                    estado: ''
                });
                carregarLinhas(token);
            } else {
                const erroDados = await resposta.json().catch(() => null);
                console.error("Erro da API:", erroDados);
                alert('Erro ao cadastrar. Verifique os campos.');
            }
        } catch (erro) {
            console.error("Erro ao ligar à API:", erro);
            alert('Erro de conexão com o servidor.');
        }
    };

    const handleExcluirLinha = async (id) => {
        if (!window.confirm('Tem a certeza de que deseja eliminar este registo?')) return;
        const token = localStorage.getItem('token');

        try {
            const resposta = await fetch(`${API_URL}/api/linhas/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (resposta.ok) {
                carregarLinhas(token);
            }
        } catch (erro) {
            console.error("Erro ao excluir linha:", erro);
        }
    };

    const handleEditarHorario = async (id, horarioAtual) => {
        const novoHorario = window.prompt("Digite o novo horário da partida:", horarioAtual);

        if (novoHorario && novoHorario !== horarioAtual) {
            const token = localStorage.getItem('token');
            try {
                const resposta = await fetch(`${API_URL}/api/linhas/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    // Enviamos exatamente a propriedade "proximaPartida" que corrigimos no C#
                    body: JSON.stringify({ proximaPartida: novoHorario })
                });

                if (resposta.ok) {
                    alert("Horário atualizado com sucesso!");
                    carregarLinhas(token); // Atualiza a lista automaticamente sem piscar o ecrã!
                } else {
                    alert("Erro ao atualizar o horário. Verifique a API.");
                }
            } catch (erro) {
                console.error("Erro na atualização:", erro);
                alert("Erro de conexão ao atualizar o horário.");
            }
        }
    };

    const sair = () => {
        localStorage.clear();
        navigate('/login');
    };

    const linhasFiltradas = linhas.filter(l =>
        l.nome?.toLowerCase().includes(busca.toLowerCase()) ||
        l.codigo?.toLowerCase().includes(busca.toLowerCase()) ||
        l.cidade?.toLowerCase().includes(busca.toLowerCase()) ||
        l.estado?.toLowerCase().includes(busca.toLowerCase())
    );

    if (!usuario) return null;

    return (
        <div className="min-h-screen bg-[#0B1120] text-slate-300 p-8 font-sans">

            {/* Cabeçalho */}
            <header className="flex justify-between items-center mb-8 border-b border-slate-800 pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Bus className="w-8 h-8 text-cyan-400" />
                        Painel Operacional (Administrador)
                    </h1>
                    <p className="text-slate-400 mt-1">Sessão ativa: <span className="text-cyan-400 font-semibold">{usuario.nome}</span></p>
                </div>
                <button onClick={sair} className="flex items-center gap-2 bg-slate-800 hover:bg-red-900/40 text-slate-300 hover:text-red-400 px-4 py-2 rounded-lg transition">
                    <LogOut className="w-4 h-4" /> Sair
                </button>
            </header>

            {/* Cartões Estatísticos */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-[#111827] border border-slate-800 p-6 rounded-xl border-t-4 border-t-cyan-500 shadow-lg flex justify-between items-center">
                    <div>
                        <p className="text-xs uppercase font-semibold text-slate-400">Linhas/Vias Ativas</p>
                        <h2 className="text-3xl font-bold text-white mt-1">{linhas.length}</h2>
                    </div>
                    <Bus className="w-8 h-8 text-cyan-500/50" />
                </div>

                <div className="bg-[#111827] border border-slate-800 p-6 rounded-xl border-t-4 border-t-emerald-500 shadow-lg flex justify-between items-center">
                    <div>
                        <p className="text-xs uppercase font-semibold text-slate-400">Fluxo Normal</p>
                        <h2 className="text-3xl font-bold text-white mt-1">{linhas.filter(l => l.status === 'Fluxo normal' || l.status === 'No horário').length}</h2>
                    </div>
                    <Clock className="w-8 h-8 text-emerald-500/50" />
                </div>

                <div className="bg-[#111827] border border-slate-800 p-6 rounded-xl border-t-4 border-t-amber-500 shadow-lg flex justify-between items-center">
                    <div>
                        <p className="text-xs uppercase font-semibold text-slate-400">Lotação/Trânsito Alto</p>
                        <h2 className="text-3xl font-bold text-white mt-1">{linhas.filter(l => l.lotacao >= 75).length}</h2>
                    </div>
                    <AlertTriangle className="w-8 h-8 text-amber-500/50" />
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
                                    <p className="text-sm text-slate-300 mt-1">"{item.descricao}"</p>
                                    <p className="text-xs text-slate-500 mt-1">Enviado por: <span className="text-slate-400 font-semibold">{item.usuarioNome}</span></p>
                                </div>

                                {!item.resolvido ? (
                                    <button
                                        onClick={() => handleResolverOcorrencia(item.id)}
                                        className="bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-800 text-emerald-400 text-xs px-3 py-2 rounded-lg font-bold transition"
                                    >
                                        ✓ Marcar como Resolvido
                                    </button>
                                ) : (
                                    <span className="text-xs text-emerald-500 font-semibold">✓ Resolvido</span>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Formulário e Monitorização */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* FORMULÁRIO DE CADASTRO */}
                <div className="bg-[#111827] border border-slate-800 p-6 rounded-2xl shadow-xl">
                    <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <PlusCircle className="w-5 h-5 text-cyan-400" /> Cadastrar Registo
                    </h2>

                    <form onSubmit={handleCadastrarLinha} className="space-y-4">

                        {/* 1. Tipo de Transporte ou Via */}
                        <div>
                            <label className="text-xs uppercase font-semibold text-slate-400 block mb-1">
                                Tipo de Transporte / Via
                            </label>
                            <select
                                required
                                value={novaLinha.nome}
                                onChange={(e) => setNovaLinha({ ...novaLinha, nome: e.target.value })}
                                className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-cyan-500"
                            >
                                <option value="">Selecione a opção...</option>
                                <option value="Ônibus Urbano">🚌 Ônibus Urbano</option>
                                <option value="Metrô">🚇 Metrô</option>
                                <option value="Trem (CPTM/SuperVia)">🚆 Trem</option>
                                <option value="Ruas/Avenidas">🛣️ Ruas / Avenidas</option>
                                <option value="Rodovias">🛣️ Rodovias</option>
                                <option value="Vicinais">🛤️ Estradas Vicinais</option>
                            </select>
                        </div>

                        {/* 2. Identificação */}
                        <div>
                            <label className="text-xs uppercase font-semibold text-slate-400 block mb-1">
                                Identificação (Linha / Nome da Via)
                            </label>
                            <input
                                type="text"
                                required
                                placeholder="Ex.: 204-UN, Av. Paulista, SP-310..."
                                value={novaLinha.codigo}
                                onChange={(e) => setNovaLinha({ ...novaLinha, codigo: e.target.value })}
                                className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-cyan-500"
                            />
                        </div>

                        {/* 3. Cidade e Estado */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs uppercase font-semibold text-slate-400 block mb-1">Cidade</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Catanduva"
                                    value={novaLinha.cidade}
                                    onChange={(e) => setNovaLinha({ ...novaLinha, cidade: e.target.value })}
                                    className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-cyan-500"
                                />
                            </div>
                            <div>
                                <label className="text-xs uppercase font-semibold text-slate-400 block mb-1">Estado</label>
                                <input
                                    type="text"
                                    required
                                    maxLength="2"
                                    placeholder="SP"
                                    value={novaLinha.estado}
                                    onChange={(e) => setNovaLinha({ ...novaLinha, estado: e.target.value })}
                                    className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-white outline-none uppercase focus:border-cyan-500"
                                />
                            </div>
                        </div>

                        {/* 4. Status e Hora (Condicional) */}
                        <div className={`grid ${['Ruas/Avenidas', 'Rodovias', 'Vicinais'].includes(novaLinha.nome) ? 'grid-cols-1' : 'grid-cols-2'} gap-3`}>
                            <div>
                                <label className="text-xs uppercase font-semibold text-slate-400 block mb-1">Status</label>
                                <select
                                    value={novaLinha.status}
                                    onChange={(e) => setNovaLinha({ ...novaLinha, status: e.target.value })}
                                    className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-cyan-500"
                                >
                                    <option value="Fluxo normal">✅ Fluxo normal</option>
                                    <option value="Atrasado">⚠️ Trânsito lento</option>
                                    <option value="Acidente na pista">🚨 Acidente na pista</option>
                                    <option value="Via interditada">🚧 Via interditada</option>
                                    <option value="Em manutenção">🛠️ Em manutenção</option>
                                </select>
                            </div>

                            {/* Só mostra o horário se NÃO for uma via/rua */}
                            {!['Ruas/Avenidas', 'Rodovias', 'Vicinais'].includes(novaLinha.nome) && (
                                <div>
                                    <label className="text-xs uppercase font-semibold text-slate-400 block mb-1">Próxima Partida</label>
                                    <div className="relative">
                                        <input
                                            type="time"
                                            required
                                            value={novaLinha.proximaPartida}
                                            onChange={(e) => setNovaLinha({ ...novaLinha, proximaPartida: e.target.value })}
                                            className="w-full bg-[#0F172A] border border-slate-700 rounded-lg pl-3 pr-8 py-2 text-white outline-none focus:border-cyan-500"
                                            style={{ colorScheme: 'dark' }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 5. Lotação / Trânsito */}
                        <div>
                            <div className="flex justify-between mb-1">
                                <label className="text-xs uppercase font-semibold text-slate-400">Lotação / Trânsito (%)</label>
                                <span className="text-xs text-slate-400">{novaLinha.lotacao}%</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={novaLinha.lotacao}
                                onChange={(e) => setNovaLinha({ ...novaLinha, lotacao: parseInt(e.target.value) })}
                                className="w-full accent-cyan-500"
                            />
                        </div>

                        <button type="submit" className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold py-3 rounded-xl transition-colors mt-2">
                            + Registar Via / Transporte
                        </button>
                    </form>
                </div>

                {/* LISTA DE MONITORIZAÇÃO */}
                <div className="lg:col-span-2 bg-[#111827] border border-slate-800 p-6 rounded-2xl shadow-xl">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <Bus className="w-5 h-5 text-cyan-400" /> Monitoramento das Linhas
                        </h2>
                        <div className="relative w-64">
                            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                            <input type="text" placeholder="Buscar por linha, código ou cidade..." value={busca} onChange={(e) => setBusca(e.target.value)} className="w-full bg-[#0F172A] border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white focus:border-cyan-500 outline-none" />
                        </div>
                    </div>

                    <div className="space-y-4">
                        {linhasFiltradas.length === 0 ? (
                            <p className="text-center py-10 text-slate-500 italic">Nenhum registo encontrado.</p>
                        ) : (
                                linhasFiltradas.map((linha) => (
                                    <div key={linha.id} className="bg-[#0F172A] border border-slate-800 p-4 rounded-xl flex items-center justify-between hover:border-slate-700 transition">
                                        <div className="flex items-center gap-4">
                                            <span className="bg-cyan-950 text-cyan-400 border border-cyan-800 text-xs px-2.5 py-1.5 rounded-lg font-mono font-bold">
                                                {linha.codigo}
                                            </span>
                                            <div>
                                                <h3 className="font-bold text-white">{linha.nome}</h3>
                                                <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                                                    <MapPin className="w-3 h-3 text-cyan-400" />
                                                    {linha.cidade ? `${linha.cidade} - ${linha.estado}` : 'Sem localização definida'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-6">
                                            <div className="text-right">
                                                <p className="text-xs text-emerald-400 font-semibold">{linha.status}</p>
                                                {(linha.nome !== 'Ruas/Avenidas' && linha.nome !== 'Rodovias' && linha.nome !== 'Vicinais') && (
                                                    <p className="text-xs text-slate-400 mt-0.5">Partida: {linha.proximaPartida}</p>
                                                )}
                                            </div>

                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleEditarHorario(linha.id, linha.proximaPartida)}
                                                    className="text-slate-500 hover:text-cyan-400 transition p-2 rounded-lg bg-slate-800/40 text-xs font-bold"
                                                    title="Editar Horário"
                                                >
                                                    Editar
                                                </button>
                                                <button
                                                    onClick={() => handleExcluirLinha(linha.id)}
                                                    className="text-slate-500 hover:text-red-400 transition p-2 rounded-lg bg-slate-800/40"
                                                    title="Excluir"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                        )}
                    </div>
                </div>

            </div>

        </div>
    );
}
