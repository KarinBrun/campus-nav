
import { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

function ProtectedRoute({ children }) {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  let expirationTime = null;
  let invalidToken = false;

  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));

      if (
        typeof payload.exp !== 'number' ||
        !Number.isFinite(payload.exp)
      ) {
        invalidToken = true;
      } else {
        expirationTime = payload.exp * 1000;
      }
    } catch {
      invalidToken = true;
    }
  }

  const expired =
    expirationTime !== null && expirationTime <= Date.now();

  useEffect(() => {
    if (!token || invalidToken || expired) {
      if (token) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
      return;
    }

    const logout = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      navigate('/login', {
        replace: true,
        state: { sessionExpired: true },
      });
    };

    const remainingTime = expirationTime - Date.now();

    if (remainingTime <= 0) {
      logout();
      return;
    }

    const timeout = setTimeout(
      logout,
      Math.min(remainingTime, 2147483647)
    );

    return () => clearTimeout(timeout);
  }, [token, invalidToken, expired, expirationTime, navigate]);

  if (!token || invalidToken) {
    return <Navigate to="/login" replace />;
  }

  if (expired) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ sessionExpired: true }}
      />
    );
  }

  return children;
}

export default ProtectedRoute;
