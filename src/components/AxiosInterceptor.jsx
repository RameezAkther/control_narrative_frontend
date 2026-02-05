import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axiosInstance';
import toast from 'react-hot-toast';

const AxiosInterceptor = ({ children }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    // 1. Set up the interceptor
    const resInterceptor = API.interceptors.response.use(
      (response) => {
        return response; // Return successful responses as is
      },
      async (error) => {
        // 2. Check for 401 Unauthorized
        if (error.response && error.response.status === 401) {
          
          // Prevent infinite loops (in case the login page itself 401s)
          if (!window.location.pathname.includes('/login')) {
            
            // 3. Trigger the actions
            toast.dismiss(); // Dismiss existing toasts
            toast.error("Session timed out. Please login again.", {
              duration: 4000,
              icon: '🔒'
            });
            
            // Clear local auth state
            if (logout) logout(); 
            
            // Redirect to login
            navigate('/login');
          }
        }
        
        // Propagate other errors so specific components can handle them if needed
        return Promise.reject(error);
      }
    );

    // 4. Cleanup: Eject the interceptor when this component unmounts
    return () => {
      API.interceptors.response.eject(resInterceptor);
    };
  }, [navigate, logout]);

  return children;
};

export default AxiosInterceptor;