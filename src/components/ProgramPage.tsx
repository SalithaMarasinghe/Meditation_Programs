import React, { useState, useEffect, ReactNode } from 'react';
import { VideoPlayer } from './VideoPlayer';
import { BookOpen, CheckCircle } from 'lucide-react';
import { Timer } from './Timer';
import { ProgramPage as ProgramPageType, Video, Resource } from '../types';

// Helper function to format text with bold markers
const formatTextWithBold = (text: string): ReactNode => {
  if (!text) return null;
  const parts = text.split('**');
  return parts.map((part, idx) => 
    idx % 2 === 1 ? (
      <strong key={idx} className="text-gray-900 font-semibold">
        {part}
      </strong>
    ) : (
      part
    )
  );
};

// Helper function to render formatted instructions with lists and paragraphs
const renderInstructions = (instructions: string): ReactNode => {
  if (!instructions) return null;
  
  const lines = instructions.split('\n');
  const elements: ReactNode[] = [];
  let currentList: ReactNode[] = [];
  let inList = false;

  const closeList = () => {
    if (inList && currentList.length > 0) {
      elements.push(
        <ul key={`list-${elements.length}`} className="list-disc pl-6 space-y-2">
          {currentList}
        </ul>
      );
      currentList = [];
      inList = false;
    }
  };

  lines.forEach((line, i) => {
    const trimmed = line.trim();
    if (!trimmed) {
      closeList();
      return;
    }

    // Check for list items
    if (trimmed.match(/^[•-]|^\d+\./)) {
      const content = trimmed.replace(/^[•-]\s*|^\d+\.\s*/, '').trim();
      currentList.push(
        <li key={`item-${i}`} className="text-gray-700">
          {formatTextWithBold(content)}
        </li>
      );
      inList = true;
    } else {
      closeList();
      elements.push(
        <p key={`p-${i}`} className="text-gray-700 mb-3">
          {formatTextWithBold(trimmed)}
        </p>
      );
    }
  });

  closeList();
  return elements;
};

interface ProgramPageProps {
  programPage: ProgramPageType;
  programName: string;
  programResources?: Resource[];
  onNextPage?: () => void;
  onPreviousPage?: () => void;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
  onVideoComplete?: (videoId: string) => void;
  completedVideos: string[];
}

const ProgramPage: React.FC<ProgramPageProps> = ({
  programPage,
  programName,
  programResources = [],
  onVideoComplete,
  onNextPage,
  onPreviousPage,
  hasNextPage = false,
  hasPreviousPage = false,
  completedVideos = []
}) => {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  
  // Set initial selected video when component mounts or programPage changes
  useEffect(() => {
    if (programPage?.videos?.length) {
      setSelectedVideo(programPage.videos[0]);
    }
  }, [programPage]);
  
  const handleVideoEnd = () => {
    if (selectedVideo) {
      onVideoComplete?.(selectedVideo.id);
    }
  };

  const handleVideoSelect = (video: Video) => {
    setSelectedVideo(video);
  };

  // Log the received props for debugging
  console.log('ProgramPage received props:', { programPage, programName, programResources });
  
  // Return early if no program page data
  if (!programPage) {
    console.log('No program page data available');
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-gray-500">No program data available</p>
      </div>
    );
  }

  const { videos = [], instructions = '' } = programPage;
  
  console.log('Program resources:', programResources);
  console.log('Program videos:', videos);

  return (
    <div className="flex-1 p-4 sm:p-6 bg-gradient-to-br from-blue-50 to-green-50 min-h-screen">
      {/* Program Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-6">
          {programName}
        </h1>
        
        {/* Instructions Section */}
        {instructions && (
          <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 mb-6">
            <div className="flex items-start space-x-3">
              <div className="bg-blue-50 p-2 sm:p-3 rounded-lg flex-shrink-0">
                <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <div className="prose prose-sm sm:prose-base max-w-none text-gray-700">
                {renderInstructions(instructions)}
              </div>
            </div>
          </div>
        )}

        {/* Video Player Section */}
        {selectedVideo && (
          <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 mb-6">
            <div className="aspect-w-16 aspect-h-9 w-full bg-black rounded-lg overflow-hidden">
              <VideoPlayer
                video={selectedVideo}
                onEnded={handleVideoEnd}
                className="w-full h-full"
              />
            </div>
            <div className="mt-4">
              <h2 className="text-xl font-semibold text-gray-800">
                {selectedVideo.name}
              </h2>
              {selectedVideo.description && (
                <p className="text-gray-600 mt-2">
                  {selectedVideo.description}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Video List */}
        {videos.length > 0 && (
          <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Videos in this section
            </h2>
            <div className="space-y-3">
              {videos.map((video) => (
                <div
                  key={video.id}
                  onClick={() => handleVideoSelect(video)}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    selectedVideo?.id === video.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start">
                    <div
                      className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                        completedVideos.includes(video.id)
                          ? 'bg-green-100 text-green-600'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {completedVideos.includes(video.id) ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <span className="font-medium">
                          {videos.findIndex((v) => v.id === video.id) + 1}
                        </span>
                      )}
                    </div>
                    <div className="ml-3">
                      <h3
                        className={`font-medium ${
                          selectedVideo?.id === video.id
                            ? 'text-blue-600'
                            : 'text-gray-800'
                        }`}
                      >
                        {video.name}
                      </h3>
                      {video.duration && (
                        <p className="text-sm text-gray-500 mt-1">
                          {video.duration}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="mt-8 flex justify-between">
          <button
            onClick={onPreviousPage}
            disabled={!hasPreviousPage}
            className={`px-4 py-2 rounded-md font-medium ${
              hasPreviousPage
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            } transition-colors`}
          >
            Previous
          </button>
          
          <button
            onClick={onNextPage}
            disabled={!hasNextPage}
            className={`px-4 py-2 rounded-md font-medium ${
              hasNextPage
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            } transition-colors`}
          >
            Next
          </button>
        </div>

        {/* Downloadable Resources Section */}
        {programResources && programResources.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">Downloadable Resources</h3>
              <p className="text-sm text-gray-500 mt-1">Download these resources to enhance your practice</p>
            </div>
            <div className="p-4 sm:p-6">
              <div className="space-y-4">
                {programResources.map((resource, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-50 rounded-md">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">
                          {resource.name.split('?')[0]} {/* Remove URL parameters from the name */}
                        </h4>
                      </div>
                    </div>
                    <a
                      href={resource.url}
                      download
                      className="ml-4 px-3 py-1.5 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Download
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Timer Section */}
        <div className="mt-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Meditation Timer</h3>
            <Timer />
          </div>
        </div>
      </div>
    </div>
  );
};

// Export as both default and named export for better compatibility
export { ProgramPage };
export default ProgramPage;