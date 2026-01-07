import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const rawApiUrl = import.meta.env.VITE_API_URL;
// Bulletproof fix: If we are on Vercel, force relative path (empty string)
// Always use the configured API URL (from Vercel env vars)
let API_URL = rawApiUrl || '';

// CRITICAL FIX: Ensure API_URL does not end with slash, to avoid //api (double slash)
if (API_URL === '/' || API_URL.endsWith('/')) {
    API_URL = API_URL.replace(/\/$/, "");
}

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  /* Auto Check-in Logic - Only for Employees/Staff */
  /* Auto Check-in Logic - Only for Employees/Staff */
  const autoCheckIn = async (parsedUser) => {
    if (parsedUser.role === 'Client') return; // Clients don't have attendance
    try {
        const url = `${API_URL}/api/attendance/check-in`;
        console.log("Checking in via:", url);
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: parsedUser.id || parsedUser._id }),
        });
        if (!res.ok && res.status !== 400) {
            console.warn("Auto check-in issue:", res.statusText);
        }
    } catch (err) {
        console.warn("Auto check-in skipped:", err.message);
    }
  };

  const autoCheckOut = async (currUser) => {
    if (currUser.role === 'Client') return; // Clients don't have attendance
    try {
        await fetch(`${API_URL}/api/attendance/check-out`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: currUser.id || currUser._id }),
        });
    } catch (err) {
        // Silent fail for checkout
    }
  };

  useEffect(() => {
    // Check for stored token
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser && savedUser !== 'undefined') {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        
        // Auto Check-in on session restore
        if (parsedUser) {
            autoCheckIn(parsedUser);
        }

      } catch (e) {
        console.error("Error parsing user from local storage", e);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    } else {
        // Clear potential bad state
        if (savedUser === 'undefined') {
            localStorage.removeItem('user');
        }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const url = `${API_URL}/api/auth/login`;
      console.log("Logging in via:", url);
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Save to local storage
      const { token, user } = data.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      setUser(user);
      
      // Auto Check-in
      if (user) {
          autoCheckIn(user);
      }

      // navigate('/'); // REMOVED: Let the calling component handle navigation based on state
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const logout = () => {
    if (user) {
        autoCheckOut(user);
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  // Refresh User Data (Profile Updates)
  const checkAuth = async () => {
    if (!user && !localStorage.getItem('user')) return;
    
    // Get ID from current state or storage
    const storedUser = user || JSON.parse(localStorage.getItem('user'));
    if (!storedUser) return;
    
    try {
        console.log("Refreshing user data...");
        // Use the auth-service endpoint we just added
        const res = await fetch(`${API_URL}/api/auth/users/${storedUser.id || storedUser._id}`);
        const data = await res.json();
        
        if (res.ok && data.success) {
            const updatedUser = data.data;
            // Merge with existing to keep token if needed, though usually user obj is enough
            const mergedUser = { ...storedUser, ...updatedUser };
            
            setUser(mergedUser);
            localStorage.setItem('user', JSON.stringify(mergedUser));
            console.log("User data refreshed:", mergedUser);
        }
    } catch (err) {
        console.error("Failed to refresh user data", err);
    }
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};
