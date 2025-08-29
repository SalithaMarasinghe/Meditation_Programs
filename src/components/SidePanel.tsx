import React from 'react';
import { MeditationProgram } from '../types';
import { Play, Settings } from 'lucide-react';

interface SidePanelProps {
  programs: MeditationProgram[];
  selectedProgram: MeditationProgram | null;
  onSelectProgram: (program: MeditationProgram) => void;
}

export const SidePanel: React.FC<SidePanelProps> = ({
  programs,
  selectedProgram,
  onSelectProgram
}) => {
  const renderProgramsList = () => {
    if (programs.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500 text-sm">No programs available</p>
        </div>
      );
    }

    return (
      <>
        {[...programs].reverse().map(program => (
          <button
            key={program.id}
            onClick={() => onSelectProgram(program)}
            className={`w-full text-left p-4 rounded-lg transition-all duration-200 group ${
              selectedProgram?.id === program.id
                ? 'bg-blue-50 border border-blue-200'
                : 'hover:bg-gray-50 border border-transparent'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800 mb-1 group-hover:text-blue-600 transition-colors">
                  {program.name}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                  {program.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {program.pages.length} pages
                  </span>
                  {selectedProgram?.id === program.id && (
                    <Play className="w-4 h-4 text-blue-600" />
                  )}
                </div>
              </div>
            </div>
          </button>
        ))}
      </>
    );
  };

  return (
    <div className="w-72 md:w-80 bg-white border-r border-gray-200 flex flex-col h-full shadow-lg md:shadow-none">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Meditation</h1>
        <p className="text-gray-600 text-sm">Find your inner peace</p>
      </div>

      <div className="px-4 py-2 border-b border-gray-100 md:hidden">
        <button 
          onClick={() => {
            // This will be handled by the parent's overlay click
          }}
          className="w-full flex items-center justify-end text-gray-500 hover:text-gray-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-20 md:pb-4">
        <div className="space-y-2">
          {renderProgramsList()}
        </div>
      </div>
    </div>
  );
};