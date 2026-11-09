import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bus, Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [erro, setErro] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setErro('');
        setLoading(true);

        try {
            const resposta = await fetch('https://transporteapi-5zn2.onrender.com/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, senha })
            });

            if (resposta.ok) {
                const dados = await resposta.json();

                // Guarda o Token e os dados do utilizador no navegador
                localStorage.setItem('token', dados.token);
                localStorage.setItem('usuario', JSON.stringify(dados.usuario));

                // Redireciona com base no nível de permissão
                if (dados.usuario.regra === 'Proprietario') {
                    navigate('/proprietario');
                } else if (dados.usuario.regra === 'Admin') {
                    navigate('/admin');
                } else {
                    navigate('/usuario'); // Usuário comum
                }
            } else {
                const erroData = await resposta.json();
                setErro(erroData.mensagem || 'Credenciais inválidas.');
            }
        } catch (err) {
            setErro('Erro ao ligar ao servidor da API.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0B1120] flex items-center justify-center p-4 font-sans">
            <div className="bg-[#111827] border border-slate-800 p-8 rounded-2xl shadow-2xl w-full max-w-md">

                {/* Cabeçalho do Login */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-cyan-900/30 border border-cyan-500/50 rounded-2xl flex items-center justify-center mb-4">
                        <Bus className="w-8 h-8 text-cyan-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-white tracking-wide">Transporte Inteligente</h1>
                    <p className="text-sm text-slate-400 mt-1">Acesso ao Painel Operacional</p>
                </div>

                {/* Mensagem de Erro */}
                {erro && (
                    <div className="mb-6 bg-red-900/30 border border-red-500/50 p-3 rounded-lg flex items-center gap-3 text-red-400 text-sm">
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        <p>{erro}</p>
                    </div>
                )}

                {/* Formulário */}
                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                            E-mail de Acesso
                        </label>
                        <div className="relative">
                            <Mail className="w-5 h-5 text-slate-500 absolute left-3 top-3" />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="exemplo@transporte.com"
                                className="w-full bg-[#0F172A] border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-white focus:border-cyan-500 outline-none transition"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                            Palavra-passe
                        </label>
                        <div className="relative">
                            <Lock className="w-5 h-5 text-slate-500 absolute left-3 top-3" />
                            <input
                                type="password"
                                required
                                value={senha}
                                onChange={(e) => setSenha(e.target.value)}
                                placeholder="••••••••"
                                className="w-full bg-[#0F172A] border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-white focus:border-cyan-500 outline-none transition"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold py-3 rounded-lg transition-colors mt-2 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {loading ? 'A verificar...' : 'Entrar no Sistema'}
                        {!loading && <ArrowRight className="w-4 h-4" />}
                    </button>

                    <div className="mt-6 pt-6 border-t border-slate-800 text-center">
                        <p className="text-slate-400 text-sm mb-3">Primeiro login no Transporte Inteligente?</p>
                        <button
                            type="button"
                            onClick={() => navigate('/cadastro')}
                            className="w-full bg-transparent border border-cyan-600/50 hover:border-cyan-400 text-cyan-400 font-semibold py-2.5 rounded-lg transition-colors"
                        >
                            Cadastrar-se (Usuário Comum)
                        </button>
                    </div>

                </form>

            </div>
        </div>
    );
}
