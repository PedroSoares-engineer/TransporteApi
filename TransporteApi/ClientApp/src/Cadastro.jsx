import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, ArrowLeft, Mail, Lock, User, Phone, Calendar, MapPin } from 'lucide-react';
import { API_URL } from './config.js';

export default function Cadastro() {
    const navigate = useNavigate();

    // 1. Estado inicial com os campos separados (Cidade e Estado limpos)
    const [form, setForm] = useState({
        nome: '',
        email: '',
        senha: '',
        telefone: '',
        dataNascimento: '',
        cidade: '',
        estado: ''
    });

    const [erro, setErro] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleCadastro = async (e) => {
        e.preventDefault();
        setErro('');
        setLoading(true);

        try {
            // 2. Fetch apontando para a porta HTTPS correta da API (7264)
            const resposta = await fetch(`${API_URL}/api/auth/registrar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });

            const dados = await resposta.json();

            if (resposta.ok) {
                alert(dados.mensagem || "Conta criada com sucesso!");
                navigate('/login');
            } else {
                setErro(dados.mensagem || "Erro ao criar conta. Verifique os dados.");
            }
        } catch (err) {
            console.error("Erro de ligação com a API:", err);
            setErro("Erro de ligação com a API. Certifique-se de que o servidor está a correr.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0B1120] text-slate-300 flex flex-col justify-center items-center p-6 font-sans">

            <div className="w-full max-w-lg bg-[#111827] border border-slate-800 p-8 rounded-2xl shadow-2xl">

                {/* Botão Voltar */}
                <Link to="/login" className="inline-flex items-center gap-2 text-slate-400 hover:text-cyan-400 mb-6 transition text-sm">
                    <ArrowLeft className="w-4 h-4" /> Voltar ao Login
                </Link>

                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <UserPlus className="w-6 h-6 text-cyan-400" />
                        Criar Conta de Passageiro
                    </h1>
                    <p className="text-sm text-slate-400 mt-1">Junte-se ao Transporte Inteligente</p>
                </div>

                {/* Mensagem de Erro */}
                {erro && (
                    <div className="mb-6 bg-red-950/60 border border-red-500/50 p-3 rounded-xl text-red-300 text-sm">
                        {erro}
                    </div>
                )}

                <form onSubmit={handleCadastro} className="space-y-4">

                    <div>
                        <label className="text-xs uppercase font-semibold text-slate-400 block mb-1">Nome Completo</label>
                        <div className="relative">
                            <User className="w-5 h-5 text-slate-500 absolute left-3 top-3" />
                            <input
                                type="text"
                                name="nome"
                                required
                                placeholder="Seu nome"
                                value={form.nome}
                                onChange={handleChange}
                                className="w-full bg-[#0F172A] border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-white outline-none focus:border-cyan-500"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs uppercase font-semibold text-slate-400 block mb-1">E-mail</label>
                            <div className="relative">
                                <Mail className="w-5 h-5 text-slate-500 absolute left-3 top-3" />
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    placeholder="seu@email.com"
                                    value={form.email}
                                    onChange={handleChange}
                                    className="w-full bg-[#0F172A] border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-white outline-none focus:border-cyan-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs uppercase font-semibold text-slate-400 block mb-1">Palavra-passe</label>
                            <div className="relative">
                                <Lock className="w-5 h-5 text-slate-500 absolute left-3 top-3" />
                                <input
                                    type="password"
                                    name="senha"
                                    required
                                    placeholder="••••••••"
                                    value={form.senha}
                                    onChange={handleChange}
                                    className="w-full bg-[#0F172A] border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-white outline-none focus:border-cyan-500"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs uppercase font-semibold text-slate-400 block mb-1">Telefone</label>
                            <div className="relative">
                                <Phone className="w-5 h-5 text-slate-500 absolute left-3 top-3" />
                                <input
                                    type="text"
                                    name="telefone"
                                    placeholder="(17) 99999-9999"
                                    value={form.telefone}
                                    onChange={handleChange}
                                    className="w-full bg-[#0F172A] border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-white outline-none focus:border-cyan-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs uppercase font-semibold text-slate-400 block mb-1">Data de Nascimento</label>
                            <div className="relative">
                                <Calendar className="w-5 h-5 text-slate-500 absolute left-3 top-3" />
                                <input
                                    type="date"
                                    name="dataNascimento"
                                    required
                                    value={form.dataNascimento}
                                    onChange={handleChange}
                                    className="w-full bg-[#0F172A] border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-slate-300 outline-none focus:border-cyan-500"
                                    style={{ colorScheme: 'dark' }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Campos de Cidade e Estado Separados */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="col-span-2">
                            <label className="text-xs uppercase font-semibold text-slate-400 block mb-1">Cidade</label>
                            <div className="relative">
                                <MapPin className="w-5 h-5 text-slate-500 absolute left-3 top-3" />
                                <input
                                    type="text"
                                    name="cidade"
                                    required
                                    placeholder="Catanduva"
                                    value={form.cidade}
                                    onChange={handleChange}
                                    className="w-full bg-[#0F172A] border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-white outline-none focus:border-cyan-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs uppercase font-semibold text-slate-400 block mb-1">Estado</label>
                            <input
                                type="text"
                                name="estado"
                                required
                                maxLength="2"
                                placeholder="SP"
                                value={form.estado}
                                onChange={handleChange}
                                className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-4 py-2.5 text-white outline-none uppercase text-center focus:border-cyan-500"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold py-3 rounded-xl transition-colors mt-4 disabled:opacity-50"
                    >
                        {loading ? 'A criar conta...' : 'Criar Conta e Aceder aos Horários'}
                    </button>

                </form>

            </div>
        </div>
    );
}
