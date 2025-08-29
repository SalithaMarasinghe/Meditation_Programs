import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { SidePanel } from './components/SidePanel';
import { ProgramPage } from './components/ProgramPage';
import { AdminDashboard } from './components/NewAdminDashboard';
import { FirebaseService } from './services/firebaseService';
import { MeditationProgram } from './types';
import { BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
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
    setSelectedProgram(program);
    setCurrentPageIndex(0);
    setCompletedVideos([]);
  };

  const handleNextPage = () => {
    if (!selectedProgram) return;
    if (currentPageIndex < selectedProgram.pages.length - 1) {
      setCurrentPageIndex(prev => {
        setTimeout(scrollToVideoPlayer, 0);
        return prev + 1;
      });
    }
  };

  const handlePreviousPage = () => {
    if (!selectedProgram) return;
    if (currentPageIndex > 0) {
      setCurrentPageIndex(prev => {
        setTimeout(scrollToVideoPlayer, 0);
        return prev - 1;
      });
    }
  };

  const handleVideoComplete = (videoId: string) => {
    setCompletedVideos(prev => 
      prev.includes(videoId) ? prev : [...prev, videoId]
    );
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
      {/* Mobile menu button */}
      <button 
        className="fixed top-4 left-4 z-30 p-2 rounded-md bg-white shadow-md md:hidden"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* SidePanel */}
      <div 
        className={`fixed md:relative z-30 h-full transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <SidePanel
          programs={programs}
          selectedProgram={selectedProgram}
          onSelectProgram={handleSelectProgram}
        />
      </div>
      
      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        {selectedProgram ? (
          <div className="max-w-4xl mx-auto">
            <ProgramPage 
              programPage={{
                ...selectedProgram.pages[currentPageIndex],
                programResources: selectedProgram.resources
              }} 
              programName={selectedProgram.name}
              onNextPage={handleNextPage}
              hasNextPage={currentPageIndex < selectedProgram.pages.length - 1}
              onVideoComplete={handleVideoComplete}
              completedVideos={completedVideos}
            />
            <div className="mt-8 flex justify-between">
              <button
                onClick={handlePreviousPage}
                disabled={currentPageIndex === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
              >
                <ChevronLeft className="inline mr-1" /> Previous Page
              </button>
              <button
                onClick={handleNextPage}
                disabled={currentPageIndex >= selectedProgram.pages.length - 1}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
              >
                Next Page <ChevronRight className="inline ml-1" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <BookOpen className="w-12 h-12 mb-4 opacity-50" />
            <p>Select a program to get started</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;