import { WallpaperProvider } from './context/WallpaperContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navigate, Route, Routes } from 'react-router';
import ChatPage from './pages/ChatPage';
import AuthPage from './pages/AuthPage';
import { useAuth } from '@clerk/react';
import PageLoader from './components/PageLoader';
import { useAuthStore } from './store/useAuthStore';
import { useEffect } from 'react';

function App() {
  const {isSignedIn , isLoaded}= useAuth();
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  useEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn) {
      checkAuth();
    } else {
      clearAuth();
    }
  }, [isLoaded, isSignedIn, checkAuth, clearAuth]);

  if (!isLoaded) return <PageLoader />;

  return (
    <ThemeProvider>
      <WallpaperProvider>
        <Routes>
          <Route path="/" element={isSignedIn? <ChatPage/>: <Navigate to ={"/auth"} replace/>} />
          <Route
            path="/auth"
            element={!isSignedIn ? <AuthPage /> : <Navigate to={"/"} replace />}
          />

        </Routes>
    
      </WallpaperProvider>
    </ThemeProvider>
  )
}

export default App

