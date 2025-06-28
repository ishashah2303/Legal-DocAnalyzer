import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

interface SidebarProps {
  isAuthenticated: boolean;
  setAuth: (auth: boolean) => void;
}

interface MenuItem {
  id: 'home' | 'summarize' | 'history' | 'settings' | 'chat';
  label: string;
  icon: string;
  path: string;
  requiresAuth?: boolean;
}

const menuItems: MenuItem[] = [
  {
    id: 'home',
    label: 'Home',
    icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
    path: '/',
  },
  {
    id: 'summarize',
    label: 'Summarize',
    icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    path: '/summarize',
    requiresAuth: true,
  },
  {
    id: 'history',
    label: 'History',
    icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
    path: '/history',
    requiresAuth: true,
  },
  {
    id: 'chat',
    label: 'Chat',
    icon: 'M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z',
    path: '/chat',
    requiresAuth: true,
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37',
    path: '/settings',
    requiresAuth: true,
  },
  
  

];

const Sidebar: React.FC<SidebarProps> = ({ isAuthenticated, setAuth }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  useEffect(() => {
    if (isAuthenticated) {
      fetchUserName();
    }
  }, [isAuthenticated]);

  const fetchUserName = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      // Use the existing endpoint from your backend
      const response = await fetch('http://localhost:5000/api/auth/user', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
      
      const data = await response.json();
      // Extract just the name from the user object
      setUserName(data.user.name);
    } catch (error) {
      console.error('Error fetching user name:', error);
      setUserName('User'); // Fallback name
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      // Call logout API endpoint to invalidate token on server
      const token = localStorage.getItem('token');
      if (token) {
        await fetch('http://localhost:5000/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      // Clear token and reset state
      localStorage.removeItem('token');
      setAuth(false);
      setUserName('');
      setIsLoading(false);
      navigate('/login');
    }
  };

  const handleSignIn = () => {
    navigate('/login');
  };
  
  // Get user's initials from name
  const getUserInitial = () => {
    if (!userName) return 'U';
    
    const nameParts = userName.split(' ');
    if (nameParts.length > 1) {
      // If there are multiple parts, use first letter of first and last name
      return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
    } else {
      // If just one word, use first letter
      return nameParts[0][0].toUpperCase();
    }
  };

  return (
    <aside className="w-64 bg-[#A0522D] text-white min-h-screen fixed left-0 top-0 z-10 shadow-lg">
      <div className="p-6 border-b border-[#8B4513]">
        <div className="flex items-center space-x-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h2 className="text-2xl font-bold">DocAnalyzer</h2>
        </div>
      </div>
      
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.id}>
              {item.requiresAuth ? (
                isAuthenticated ? (
                  <Link
                    to={item.path}
                    className={`w-full flex items-center space-x-3 p-3 rounded-md transition-colors ${
                      location.pathname === item.path
                        ? 'bg-white text-[#A0522D] font-medium'
                        : 'text-white hover:bg-[#8B4513]'
                    }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d={item.icon}
                      />
                    </svg>
                    <span>{item.label}</span>
                  </Link>
                ) : (
                  <button 
                    onClick={handleSignIn} 
                    className="w-full flex items-center space-x-3 p-3 rounded-md transition-colors text-white opacity-70 hover:bg-[#8B4513]"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d={item.icon}
                      />
                    </svg>
                    <span>{item.label}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </button>
                )
              ) : (
                <Link
                  to={item.path}
                  className={`w-full flex items-center space-x-3 p-3 rounded-md transition-colors ${
                    location.pathname === item.path
                      ? 'bg-white text-[#A0522D] font-medium'
                      : 'text-white hover:bg-[#8B4513]'
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d={item.icon}
                    />
                  </svg>
                  <span>{item.label}</span>
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[#8B4513]">
        {isAuthenticated ? (
          <div className="flex items-center space-x-3">
            {isLoading ? (
              <div className="w-8 h-8 rounded-full bg-white/30 animate-pulse"></div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-white text-[#A0522D] flex items-center justify-center font-bold">
                {getUserInitial()}
              </div>
            )}
            <div className="flex-1">
              {isLoading ? (
                <div className="h-4 bg-white/30 rounded animate-pulse w-20 mb-1"></div>
              ) : (
                <p className="text-sm font-medium truncate">
                  {userName || 'User'}
                </p>
              )}
            </div>
            <button 
              onClick={handleSignOut} 
              className="text-white hover:text-red-200 transition-colors cursor-pointer"
              aria-label="Sign out"
              title="Sign out"
              disabled={isLoading}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-5 w-5 ${isLoading ? 'opacity-50' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </button>
          </div>
        ) : (
          <button 
            onClick={handleSignIn}
            className="w-full flex items-center justify-center space-x-2 bg-white text-[#A0522D] p-2 rounded-md hover:bg-gray-100 transition-colors font-medium"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            <span>Sign In</span>
          </button>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;