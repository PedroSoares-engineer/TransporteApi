import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import DashboardAdmin from './DashboardAdmin';
import DashboardProprietario from './DashboardProprietario';
import Cadastro from './Cadastro';
import DashboardUsuario from './DashboardUsuario'; // <-- Adiciona este import

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Navigate to="/login" />} />
                <Route path="/login" element={<Login />} />
                <Route path="/cadastro" element={<Cadastro />} />
                <Route path="/usuario" element={<DashboardUsuario />} />
                <Route path="/admin" element={<DashboardAdmin />} />
                <Route path="/proprietario" element={<DashboardProprietario />} />
            </Routes>
        </BrowserRouter>
    );
}
