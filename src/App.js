import logo from './logo.svg';
import './App.css';
import {BrowserRouter, Route, Routes} from 'react-router';
import React, { useState, useEffect } from 'react';
import { testConnection } from './api';
import Home from './Pages/Home';
import About from './Pages/About';
import Navbar from './Components/NavBar';
import Footer from './Components/Footer';
import Login from './Pages/Login';
import ClientManagement from './Pages/ClientManagement';
// import ReportAnalysis from './Pages/ReportAnalysis';
import RegistrationForm from './Pages/RegistrationForm';
import BankIDAuthPage from './Pages/BankIDAuthPage';
import ViewQR from './Pages/ViewQR';
import RegistrationSuccess from './Pages/RegistrationSuccess';


function App() {
  const [dbStatus, setDbStatus] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await testConnection();
        setDbStatus(response.data);
      } catch (err) {
        setError(err.message);
      }
    };
    checkConnection();
  }, []);

  return (
    
    <div className="App">
      <div style={{ padding: '20px' }}>
      <h1>React + Node.js + PostgreSQL</h1>
      {dbStatus ? (
        <div>
          <h2 style={{ color: 'green' }}>✅ Connection Successful</h2>
          <p>Message: {dbStatus.message}</p>
          <p>Database Time: {new Date(dbStatus.time).toString()}</p>
        </div>
      ) : error ? (
        <h2 style={{ color: 'red' }}>❌ Connection Failed: {error}</h2>
      ) : (
        <p>Testing connection...</p>
      )}
    </div>

      <Navbar/>
      <div className="content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login/>} />
          <Route path="/client-management" element={<ClientManagement />} />
          {/* <Route path="/report-analysis" element={<ReportAnalysis />} /> */}
          <Route path="/clientform" element={<RegistrationForm />} />
          <Route path="/bankid-auth/:authRef" element={<BankIDAuthPage />} />
          <Route path="/view-qr/:token" element={<ViewQR />} />
          <Route path="/registration-success" element={<RegistrationSuccess />} />

        </Routes>
      </div>
      <Footer/>
    </div>
  );
}

export default App;
