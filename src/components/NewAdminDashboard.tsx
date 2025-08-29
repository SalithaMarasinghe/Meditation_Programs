import React, { useState } from 'react';
import { MeditationProgram, ProgramPage, Video, Resource } from '../types';
import { FirebaseService } from '../services/firebaseService';
import { Plus, Edit, Trash2, CheckCircle } from 'lucide-react';
import { VideoUploader } from './VideoUploader';
import { ResourceManager } from './ResourceManager';

interface AdminDashboardProps {
  programs: MeditationProgram[];
  onProgramsChange: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  programs,
  onProgramsChange,
}) => {
  const [selectedProgram, setSelectedProgram] = useState<MeditationProgram | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingProgram, setEditingProgram] = useState<Partial<MeditationProgram>>({
    name: '',
    description: '',
    instructions: '',
    pages: [],
    resources: [],
  });
  const [activeTab, setActiveTab] = useState<'videos' | 'resources'>('videos');

  // Handle resource management
  const handleAddResource = (url: string, name: string) => {
    const newResource: Resource = { 
      name, 
      url, 
      type: url.split('.').pop()?.toLowerCase() || 'file' 
    };
    
    setEditingProgram(prev => ({
      ...prev,
      resources: [...(prev.resources || []), newResource]
    }));
  };

  const handleDeleteResource = (index: number) => {
    setEditingProgram(prev => ({
      ...prev,
      resources: (prev.resources || []).filter((_, i) => i !== index)
    }));
  };

  // Program CRUD operations
  const handleCreateProgram = () => {
    setSelectedProgram(null);
    setEditingProgram({
      name: '',
      description: '',
      instructions: '',
      pages: [],
      resources: []
    });
    setIsEditing(true);
  };

  const handleEditProgram = (program: MeditationProgram) => {
    setSelectedProgram(program);
    setEditingProgram({ 
      ...program,
      resources: program.resources || []
    });
    setIsEditing(true);
  };

  const handleSaveProgram = async () => {
    try {
      const programData = {
        ...editingProgram,
        resources: editingProgram.resources || [],
        pages: (editingProgram.pages || []).map(page => ({
          ...page,
          resources: page.resources || []
        }))
      };

      if (selectedProgram) {
        await FirebaseService.updateProgram(selectedProgram.id, programData);
      } else {
        await FirebaseService.createProgram(programData as Omit<MeditationProgram, 'id' | 'createdAt' | 'updatedAt'>);
      }
      
      setIsEditing(false);
      setEditingProgram({});
      setSelectedProgram(null);
      onProgramsChange();
    } catch (error) {
      console.error('Error saving program:', error);
    }
  };

  const handleDeleteProgram = async (programId: string) => {
    if (window.confirm('Are you sure you want to delete this program?')) {
      try {
        await FirebaseService.deleteProgram(programId);
        onProgramsChange();
      } catch (error) {
        console.error('Error deleting program:', error);
      }
    }
  };

  // Page management
  const addPage = () => {
    const newPage: ProgramPage = {
      id: `page-${Date.now()}`,
      pageNumber: (editingProgram.pages?.length || 0) + 1,
      instructions: '',
      videos: [],
      resources: []
    };
    
    setEditingProgram(prev => ({
      ...prev,
      pages: [...(prev.pages || []), newPage]
    }));
  };

  const updatePage = (pageId: string, updates: Partial<ProgramPage>) => {
    setEditingProgram(prev => ({
      ...prev,
      pages: (prev.pages || []).map(page => 
        page.id === pageId ? { ...page, ...updates } : page
      )
    }));
  };

  const deletePage = (pageId: string) => {
    setEditingProgram(prev => ({
      ...prev,
      pages: (prev.pages || []).filter(page => page.id !== pageId)
    }));
  };

  // Video management
  const addVideoToPage = (pageId: string) => {
    const newVideo: Video = {
      id: `video-${Date.now()}`,
      name: '',
      description: '',
      url: ''
    };

    setEditingProgram(prev => ({
      ...prev,
      pages: (prev.pages || []).map(page => 
        page.id === pageId 
          ? { ...page, videos: [...(page.videos || []), newVideo] } 
          : page
      )
    }));
  };

  const handleVideoUpload = (videoId: string, url: string) => {
    setEditingProgram(prev => ({
      ...prev,
      pages: (prev.pages || []).map(page => ({
        ...page,
        videos: (page.videos || []).map(video => 
          video.id === videoId ? { ...video, url } : video
        )
      }))
    }));
  };

  const updateVideo = (videoId: string, updates: Partial<Video>) => {
    setEditingProgram(prev => {
      const updatedPages = (prev.pages || []).map(page => {
        const videoIndex = page.videos?.findIndex(v => v.id === videoId) ?? -1;
        if (videoIndex >= 0) {
          const updatedVideos = [...(page.videos || [])];
          updatedVideos[videoIndex] = { ...updatedVideos[videoIndex], ...updates };
          return { ...page, videos: updatedVideos };
        }
        return page;
      });
      
      return { ...prev, pages: updatedPages };
    });
  };

  const deleteVideo = (pageId: string, videoId: string) => {
    setEditingProgram(prev => ({
      ...prev,
      pages: (prev.pages || []).map(page => 
        page.id === pageId
          ? {
              ...page,
              videos: (page.videos || []).filter(video => video.id !== videoId)
            }
          : page
      )
    }));
  };

  // Render program form
  const renderProgramForm = () => (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          {selectedProgram ? 'Edit Program' : 'Create New Program'}
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('videos')}
            className={`px-4 py-2 rounded-md ${
              activeTab === 'videos' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Videos
          </button>
          <button
            onClick={() => setActiveTab('resources')}
            className={`px-4 py-2 rounded-md ${
              activeTab === 'resources' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Resources
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Program Name</label>
          <input
            type="text"
            value={editingProgram.name || ''}
            onChange={(e) => setEditingProgram({...editingProgram, name: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Enter program name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={editingProgram.description || ''}
            onChange={(e) => setEditingProgram({...editingProgram, description: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            rows={3}
            placeholder="Enter program description"
          />
        </div>

        {activeTab === 'videos' ? (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Pages</h3>
              <button
                onClick={addPage}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm flex items-center space-x-1"
              >
                <Plus className="w-4 h-4" />
                <span>Add Page</span>
              </button>
            </div>

            {editingProgram.pages?.map((page) => (
              <div key={page.id} className="mb-6 p-4 border rounded-lg">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium">Page {page.pageNumber}</h4>
                  <button
                    onClick={() => deletePage(page.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Instructions
                  </label>
                  <textarea
                    value={page.instructions}
                    onChange={(e) => updatePage(page.id, { instructions: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows={2}
                    placeholder="Enter page instructions"
                  />
                </div>

                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <h5 className="text-sm font-medium text-gray-700">Videos</h5>
                    <button
                      onClick={() => addVideoToPage(page.id)}
                      className="text-blue-600 hover:text-blue-800 text-sm flex items-center space-x-1"
                      type="button"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Video</span>
                    </button>
                  </div>

                  {page.videos?.map((video) => (
                    <div key={video.id} className="mb-4 p-3 border rounded bg-gray-50">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <input
                            type="text"
                            value={video.description}
                            onChange={(e) => updateVideo(video.id, { description: e.target.value })}
                            className="w-full text-sm text-gray-700 bg-transparent border-b border-transparent focus:border-gray-300 focus:outline-none"
                            placeholder="Enter video description"
                          />
                        </div>
                        <button
                          onClick={() => deleteVideo(page.id, video.id)}
                          className="text-red-600 hover:text-red-800 ml-2"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="mb-2">
                        <label className="block text-xs text-gray-500 mb-1">Video Title</label>
                        <input
                          type="text"
                          value={video.name || ''}
                          onChange={(e) => updateVideo(video.id, { name: e.target.value })}
                          className="w-full px-2 py-1 text-sm border border-gray-200 rounded"
                          placeholder="Video title (optional)"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Video URL</label>
                        <VideoUploader
                          onUploadComplete={(url) => handleVideoUpload(video.id, url)}
                          folderPath={`programs/${selectedProgram?.id || 'new'}/videos`}
                        />
                        {video.url && (
                          <div className="mt-1 text-xs text-green-600 flex items-center">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Video uploaded
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Program Resources</h3>
              <ResourceManager
                resources={editingProgram.resources || []}
                onDelete={handleDeleteResource}
                onUpload={handleAddResource}
                folderPath={`programs/${selectedProgram?.id || 'new'}/resources`}
              />
            </div>

            {editingProgram.pages?.map((page) => (
              <div key={page.id} className="border-t pt-4">
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  Page {page.pageNumber} Resources
                </h3>
                <ResourceManager
                  resources={page.resources || []}
                  onDelete={(index) => {
                    const updatedPages = [...(editingProgram.pages || [])];
                    const updatedResources = [...(page.resources || [])];
                    updatedResources.splice(index, 1);
                    
                    const pageIndex = updatedPages.findIndex(p => p.id === page.id);
                    if (pageIndex !== -1) {
                      updatedPages[pageIndex] = {
                        ...page,
                        resources: updatedResources
                      };
                      
                      setEditingProgram(prev => ({
                        ...prev,
                        pages: updatedPages
                      }));
                    }
                  }}
                  onUpload={(url, name) => {
                    const newResource: Resource = { 
                      name, 
                      url, 
                      type: url.split('.').pop()?.toLowerCase() || 'file' 
                    };
                    
                    const updatedPages = [...(editingProgram.pages || [])];
                    const pageIndex = updatedPages.findIndex(p => p.id === page.id);
                    
                    if (pageIndex !== -1) {
                      updatedPages[pageIndex] = {
                        ...page,
                        resources: [...(page.resources || []), newResource]
                      };
                      
                      setEditingProgram(prev => ({
                        ...prev,
                        pages: updatedPages
                      }));
                    }
                  }}
                  folderPath={`programs/${selectedProgram?.id || 'new'}/pages/${page.id}/resources`}
                />
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <button
            onClick={() => {
              setIsEditing(false);
              setEditingProgram({});
              setSelectedProgram(null);
            }}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveProgram}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Save Program
          </button>
        </div>
      </div>
    </div>
  );

  // Render program list
  const renderProgramList = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Programs</h2>
        <button
          onClick={handleCreateProgram}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>New Program</span>
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {programs.map((program) => (
          <div key={program.id} className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-lg font-semibold text-gray-800">{program.name}</h3>
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
              {program.description}
            </p>
            <div className="mt-3 flex justify-between items-center text-sm text-gray-500">
              <span>{program.pages?.length || 0} pages</span>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEditProgram(program)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteProgram(program.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="container mx-auto p-6">
      {isEditing ? renderProgramForm() : renderProgramList()}
    </div>
  );
};

export default AdminDashboard;
