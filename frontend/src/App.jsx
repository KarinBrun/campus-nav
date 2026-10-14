import { Routes, Route, useLocation } from 'react-router-dom';
import './App.scss';

import Header from './components/Header';
import Home from './pages/Home';
import Map from './pages/Map';
import FindClassroom from './pages/FindClassroom';
import Schedule from './pages/Schedule';
import Events from './pages/Events';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';
import Account from './pages/Account';


function App() {
  const location = useLocation();
  const showHeader = !['/login', '/register'].includes(location.pathname);

  return (
    <div className={`app ${!showHeader ? 'auth-layout' : ''}`}>
      {showHeader && <Header />}

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />

        <Route
          path="/map"
          element={
            <ProtectedRoute>
              <Map />
            </ProtectedRoute>
          }
        />

        <Route
          path="/find-classroom"
          element={
            <ProtectedRoute>
              <FindClassroom />
            </ProtectedRoute>
          }
        />

        <Route
          path="/schedule"
          element={
            <ProtectedRoute>
              <Schedule />
            </ProtectedRoute>
          }
        />

        <Route
          path="/events"
          element={
            <ProtectedRoute>
              <Events />
            </ProtectedRoute>
          }
        />

        <Route
          path="/account"
          element={
            <ProtectedRoute>
              <Account />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;