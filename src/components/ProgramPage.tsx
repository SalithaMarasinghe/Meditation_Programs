import React, { useState, ReactNode } from 'react';
import { VideoPlayer } from './VideoPlayer';
import { BookOpen } from 'lucide-react';
import { Timer } from './Timer';
import { ProgramPage as ProgramPageType, Video, Resource } from '../types';
import { ResourcesDownload } from './ResourcesDownload';

interface ProgramPageProps {
  programPage: ProgramPageType & {
    programResources?: Resource[];
  };
  programName: string;
  onNextPage?: () => void;
  hasNextPage?: boolean;
  onVideoComplete?: (videoId: string) => void;
  completedVideos: string[];
}

export const ProgramPage: React.FC<ProgramPageProps> = ({
  programPage,
  programName,
  onVideoComplete,
  completedVideos = []
}) => {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(programPage.videos[0] || null);
  
  const handleVideoEnd = (video: Video) => {
    onVideoComplete?.(video.id);
  };


  // Debug log the video data
  console.log('Selected Video:', selectedVideo);
  console.log('All Videos:', programPage.videos);

  return (
    <div className="flex-1 p-6 bg-gradient-to-br from-blue-50 to-green-50 min-h-screen">
      {/* Program Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">{programName}</h1>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-start space-x-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Instructions for This Session</h2>
              <div className="prose prose-blue max-w-none text-gray-700 leading-relaxed space-y-4">
                {(() => {
                  const lines = programPage.instructions.split('\n');
                  const elements: ReactNode[] = [];
                  let currentList: ReactNode[] | null = null;

                  for (let i = 0; i < lines.length; i++) {
                    const line = lines[i].trim();
                    if (!line) continue;

                    // Check for list items
                    if (line.match(/^[•-]|^\d+\./)) {
                      const content = line.replace(/^[•-]\s*|^\d+\.\s*/, '').trim();
                      
                      // Start a new list if not in one
                      if (!currentList) {
                        currentList = [];
                        elements.push(
                          <ul key={`list-${i}`} className="list-disc pl-6 space-y-2">
                            <li className="text-gray-700">{content}</li>
                            {currentList}
                          </ul>
                        );
                      } else {
                        // Continue existing list
                        currentList.push(
                          <li key={i} className="text-gray-700">
                            {content}
                          </li>
                        );
                      }
                    } else {
                      // End current list if exists
                      currentList = null;
                      
                      // Add regular paragraph with bold support
                      const parts = line.split('**');
                      const formatted = parts.map((part, idx) => 
                        idx % 2 === 1 ? (
                          <strong key={idx} className="text-gray-900">
                            {part}
                          </strong>
                        ) : (
                          part
                        )
                      );
                      
                      elements.push(
                        <p key={`p-${i}`} className="text-gray-700">
                          {formatted}
                        </p>
                      );
                    }
                  }
                  
                  return elements;
                })()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Video Section */}
      {selectedVideo && (
        <div id="videoPlayer" className="mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Current Video</h3>
            <VideoPlayer
              video={selectedVideo}
              onEnded={() => handleVideoEnd(selectedVideo)}
              className="mb-4"
            />
            <div className="mt-4">
              <h4 className="font-semibold text-gray-800 mb-2">{selectedVideo.name}</h4>
              <p className="text-gray-600 whitespace-pre-line">
                {selectedVideo.description && selectedVideo.description
                  .replace(/(Sinhala:|English:)/g, '<span class="font-bold">$1</span>')
                  .split('\n')
                  .map((line, i) => (
                    <React.Fragment key={i}>
                      <span dangerouslySetInnerHTML={{ __html: line }} />
                      <br />
                    </React.Fragment>
                  ))}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Video List */}
      <div className="mb-8">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Page Videos</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {programPage.videos.map((video, index) => (
              <div
                key={video.id}
                className={`bg-white rounded-lg p-4 shadow-sm border transition-all duration-200 hover:shadow-md ${
                  selectedVideo?.id === video.id 
                    ? 'border-blue-500 ring-2 ring-blue-200' 
                    : 'border-gray-100 hover:border-gray-200'
                } ${completedVideos.includes(video.id) ? 'bg-green-50' : ''}`}
              >
                <div 
                  className="flex items-start justify-between cursor-pointer"
                  onClick={() => setSelectedVideo(video)}
                >
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-800">{video.name || video.description || `Video ${index + 1}`}</h4>
                      {completedVideos.includes(video.id) && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          Completed
                        </span>
                      )}
                    </div>
                  </div>
                  {selectedVideo?.id === video.id && (
                    <div className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0 ml-3 mt-1"></div>
                  )}
                </div>
                
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Download Resources Section */}
      <div className="mt-8">
        {programPage.programResources && programPage.programResources.length > 0 && (
          <ResourcesDownload 
            resources={programPage.programResources.map(resource => ({
              name: resource.name,
              url: resource.url,
              type: resource.type || 'file'
            }))} 
          />
        )}
      </div>

      {/* Timer Section */}
      <div className="mt-8">
        <Timer />
      </div>


      {/* Next page navigation is handled in the parent component */}
    </div>
  );
};