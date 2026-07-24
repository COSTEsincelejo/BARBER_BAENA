import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Cliente from "./pages/Cliente.jsx";
import Admin from "./pages/Admin.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Cliente />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
