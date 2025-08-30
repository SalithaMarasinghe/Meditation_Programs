import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { SidePanel } from './components/SidePanel';
import { ProgramPage } from './components/ProgramPage';
import { AdminDashboard } from './components/NewAdminDashboard';
import { FirebaseService } from './services/firebaseService';
import { MeditationProgram } from './types';
import LoginPage from './pages/LoginPage';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

// Main App Component with Authentication
const App = () => {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
};

// Component to handle routing
const AppRoutes = () => {
  const location = useLocation();
  
  if (location.pathname === '/admin' || location.pathname === '/admin/') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return (
    <Routes>
      <Route path="/admin/login" element={<LoginPage />} />
      <Route 
        path="/admin/*" 
        element={
          <ProtectedRoute>
            <AdminApp />
          </ProtectedRoute>
        } 
      />
      <Route path="/*" element={<UserApp />} />
    </Routes>
  );
};

// Component for Admin Interface
const AdminApp = () => {
  const [programs, setPrograms] = useState<MeditationProgram[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = FirebaseService.onProgramsChange((newPrograms) => {
      setPrograms(newPrograms);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const refreshPrograms = async () => {
    try {
      const newPrograms = await FirebaseService.getPrograms();
      setPrograms(newPrograms);
    } catch (error) {
      console.error('Error refreshing programs:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-gray-600">Loading admin dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminDashboard 
        programs={programs}
        onProgramsChange={refreshPrograms}
      />
    </div>
  );
};

// Component for User Interface

const UserApp = () => {
  // State declarations at the top
  const [programs, setPrograms] = useState<MeditationProgram[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<MeditationProgram | null>(null);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [completedVideos, setCompletedVideos] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // All effects together
  useEffect(() => {
    const unsubscribe = FirebaseService.onProgramsChange((newPrograms) => {
      setPrograms(newPrograms);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPageIndex]);

  useEffect(() => {
    if (selectedProgram && window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  }, [selectedProgram]);

  // Helper functions
  const scrollToVideoPlayer = () => {
    const videoPlayer = document.getElementById('videoPlayer');
    if (videoPlayer) {
      videoPlayer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSelectProgram = (program: MeditationProgram) => {
    console.log('Selected program:', program);
    console.log('Program pages:', program.pages);
    if (program.pages && program.pages.length > 0) {
      console.log('First page resources:', program.pages[0].resources);
    }
    setSelectedProgram(program);
    setCurrentPageIndex(0);
    setCompletedVideos([]);
  };

  const handleNextPage = () => {
    if (!selectedProgram) return;
    if (currentPageIndex < selectedProgram.pages.length - 1) {
      setCurrentPageIndex((prev: number) => {
        setTimeout(scrollToVideoPlayer, 0);
        return prev + 1;
      });
    }
  };

  // Removed unused handlePreviousPage function

  const handleVideoComplete = (videoId: string) => {
    setCompletedVideos((prev: string[]) => prev.includes(videoId) ? prev : [...prev, videoId]);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-600">Loading meditation programs...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 relative">
      {/* Sidebar */}
      <SidePanel
        programs={programs}
        selectedProgram={selectedProgram}
        onSelectProgram={handleSelectProgram}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onToggle={() => {
          console.log('Toggling sidebar. Current state:', isSidebarOpen);
          setIsSidebarOpen((prev: boolean) => {
            console.log('Setting sidebar to:', !prev);
            return !prev;
          });
        }}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          {selectedProgram ? (
            <ProgramPage
              programPage={selectedProgram.pages[currentPageIndex]}
              programName={selectedProgram.name}
              programResources={selectedProgram.resources || []}
              onNextPage={handleNextPage}
              hasNextPage={currentPageIndex < (selectedProgram.pages.length - 1)}
              onVideoComplete={handleVideoComplete}
              completedVideos={completedVideos}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center p-8 max-w-md">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Welcome to Guided Meditations</h2>
                <p className="text-gray-600 mb-6">Select a program from the sidebar to get started.</p>
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 md:hidden"
                >
                  Browse Programs
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;