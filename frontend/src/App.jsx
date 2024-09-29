import { useState } from 'react'
import './App.css'
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import { Navigate, Route, Routes } from 'react-router-dom';
import AdminPanel from './pages/adminPanel';
import Login from './pages/login';
import Register from './pages/register';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};


function App() {

  return (
    <>
    <Routes>
      <Route path="/admin" element={<ProtectedRoute><AdminPanel/></ProtectedRoute>} />
      {/* <Route path="/admin" element={<AdminPanel/>} /> */}
      <Route path="/login" element={<Login/>} />
      <Route path="/register" element={<Register/>} />
    </Routes>
    </>
  )
}

export default App
