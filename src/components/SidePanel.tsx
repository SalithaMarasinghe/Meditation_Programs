import React, { useEffect, useCallback, ReactNode } from 'react';
import { MeditationProgram } from '../types';
import { Play, X } from 'lucide-react';

interface SidePanelProps {
  programs: MeditationProgram[];
  selectedProgram: MeditationProgram | null;
  onSelectProgram: (program: MeditationProgram) => void;
  isOpen: boolean;
  onClose: () => void;
  onToggle: () => void;
  isLoading?: boolean;
  error?: string | null;
}

export const SidePanel: React.FC<SidePanelProps> = ({
  programs = [],
  selectedProgram,
  onSelectProgram,
  isOpen,
  onClose,
  onToggle,
  isLoading = false,
  error = null
}) => {
  const handleProgramSelect = useCallback((program: MeditationProgram) => {
    onSelectProgram(program);
    if (window.innerWidth < 768) {
      onClose();
    }
  }, [onSelectProgram, onClose]);

  // Escape key closes sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const renderContent = (): ReactNode => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></div>
        </div>
      );
    }
    if (error) {
      return (
        <div className="p-4 text-red-600 text-sm bg-red-50 rounded m-2">
          Error loading programs: {error}
        </div>
      );
    }
    if (programs.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500 text-sm">No programs available</p>
        </div>
      );
    }
    return (
      <div className="space-y-3 p-4">
        {[...programs].reverse().map((program) => (
          <div
            key={program.id}
            onClick={() => handleProgramSelect(program)}
            className={`p-3 rounded-lg cursor-pointer transition-colors ${
              selectedProgram?.id === program.id
                ? 'bg-blue-50 border-l-4 border-blue-500'
                : 'hover:bg-gray-50 border-l-4 border-transparent'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">{program.name}</h3>
                <p className="text-sm text-gray-500">{program.description}</p>
              </div>
              <Play className="h-4 w-4 text-gray-400" />
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      {/* Menu Button - Now visible on all screen sizes */}
      <button
        onClick={onToggle}
        className="fixed top-4 left-4 z-50 p-2 rounded-md bg-white shadow-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none"
            viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round"
              strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {/* Overlay - Now visible on all screen sizes when sidebar is open */}
      <div
        onClick={onClose}
        style={{
          opacity: isOpen ? 0.5 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
          transition: 'opacity 300ms ease-in-out'
        }}
        className="fixed inset-0 bg-black z-40"
        aria-hidden="true"
      />

      {/* Sidebar - Always fixed overlay */}
      <div
        style={{
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 300ms ease-in-out'
        }}
        className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg z-50"
      >
        <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white z-10">
          <h2 className="text-lg font-semibold">Programs</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            aria-label="Close menu"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>
        <div className="overflow-y-auto h-[calc(100%-4rem)]">
          {renderContent()}
        </div>
      </div>
    </>
  );
};