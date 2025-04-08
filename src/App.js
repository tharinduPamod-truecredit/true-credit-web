import logo from './logo.svg';
import './App.css';
import {BrowserRouter, Route, Routes} from 'react-router';
import Home from './Pages/Home';
import About from './Pages/About';
import Navbar from './Components/NavBar';
import Footer from './Components/Footer';
import Login from './Pages/Login';
import ClientManagement from './Pages/ClientManagement';
import ReportAnalysis from './Pages/ReportAnalysis';
import RegistrationForm from './Pages/RegistrationForm';

function App() {
  return (
    <div className="App">
      <Navbar/>
      <div className="content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login/>} />
          <Route path="/client-management" element={<ClientManagement />} />
          <Route path="/report-analysis" element={<ReportAnalysis />} />
          <Route path="/clientform" element={<RegistrationForm />} />
        </Routes>
      </div>
      <Footer/>
    </div>
  );
}

export default App;
