// // src/App.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import CarList from './pages/CarList';
import CarDetail from './pages/CarDetail';
import Login from './pages/Login';
import Register from './pages/Register'
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar'

function App() {
  return (
    <AuthProvider>
        <div>
        <Navbar />
          <Routes>
            <Route path="/" element={<CarList />} />
            <Route path="/cars/:id" element={<CarDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </div>
    </AuthProvider>
  );
}

export default App;


// src/App.js
// import React from 'react';
// import { Routes, Route } from 'react-router-dom';
// import Navbar from './components/Navbar'; // Import Navbar
// import CarList from './pages/CarList';
// import CarDetail from './pages/CarDetail';
// import Login from './pages/Login';
// import Register from './pages/Register';
// import { AuthProvider } from './contexts/AuthContext';

// function App() {
//   return (
//     <AuthProvider>
//       <div>
//         <Navbar /> {/* Navbar will appear on every page */}
//         <Routes>
//           <Route path="/" element={<CarList />} />
//           <Route path="/cars/:id" element={<CarDetail />} />
//           <Route path="/login" element={<Login />} />
//           <Route path="/register" element={<Register />} />
//         </Routes>
//       </div>
//     </AuthProvider>
//   );
// }

// export default App;
