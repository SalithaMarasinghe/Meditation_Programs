import React, { useState } from 'react';
import { MeditationProgram, ProgramPage, Video } from '../types';
import { FirebaseService } from '../services/firebaseService';
import { Plus, Edit, Trash2, Save, X, Video as VideoIcon } from 'lucide-react';
import { VideoUploader } from './VideoUploader';
import { CheckCircle } from 'lucide-react';
import { scrollToElement } from '../utils/scroll';

interface AdminDashboardProps {
  programs: MeditationProgram[];
  onProgramsChange: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  programs,
  onProgramsChange
}) => {
  const [selectedProgram, setSelectedProgram] = useState<MeditationProgram | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingProgram, setEditingProgram] = useState<Partial<MeditationProgram>>({});
  
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
    setEditingProgram({ ...program });
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

  const addPage = () => {
    const newPage: ProgramPage = {
      id: Date.now().toString(),
      pageNumber: (editingProgram.pages?.length || 0) + 1,
      instructions: '',
      videos: [],
      resources: [] // <-- Fix: add missing resources property
    };
    setEditingProgram({
      ...editingProgram,
      pages: [...(editingProgram.pages || []), newPage]
    });
  };

  const updatePage = (pageId: string, updates: Partial<ProgramPage>) => {
    setEditingProgram({
      ...editingProgram,
      pages: editingProgram.pages?.map(page =>
        page.id === pageId ? { ...page, ...updates } : page
      ) || []
    });
  };

  const deletePage = (pageId: string) => {
    setEditingProgram({
      ...editingProgram,
      pages: editingProgram.pages?.filter(page => page.id !== pageId) || []
    });
  };

  const addVideoToPage = (pageId: string) => {
    const newVideo = {  // Remove type annotation to avoid spread issues
      id: Date.now().toString(),
      name: 'Untitled Video',
      description: '',
      url: ''
    };

    setEditingProgram({
      ...editingProgram,
      pages: editingProgram.pages?.map(page =>
        page.id === pageId
          ? { ...page, videos: [...(page.videos || []), {...newVideo}] }  // Fix: Spread newVideo properly
          : page
      ) || []
    });
  };

  const handleVideoUpload = (pageId: string, videoId: string, url: string) => {
    setEditingProgram({
      ...editingProgram,
      pages: editingProgram.pages?.map(page =>
        page.id === pageId
          ? {
              ...page,
              videos: page.videos.map(video =>
                video.id === videoId ? { ...video, url } : video
              )
            }
          : page
      ) || []
    });
  };

  const updateVideo = (pageId: string, videoId: string, updates: Partial<Video>) => {
    setEditingProgram({
      ...editingProgram,
      pages: editingProgram.pages?.map(page =>
        page.id === pageId
          ? {
              ...page,
              videos: page.videos.map(video =>
                video.id === videoId ? { ...video, ...updates } : video
              )
            }
          : page
      ) || []
    });
  };

  const deleteVideo = (pageId: string, videoId: string) => {
    setEditingProgram({
      ...editingProgram,
      pages: editingProgram.pages?.map(page =>
        page.id === pageId
          ? { ...page, videos: page.videos.filter(video => video.id !== videoId) }
          : page
      ) || []
    });
  };

  const handleVideoNavigation = () => {
    scrollToElement('videoPlayer');
  };

  return (
    <div className="flex-1 p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
          <button
            onClick={handleCreateProgram}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>New Program</span>
          </button>
        </div>

        {isEditing ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {/* Program Form */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">
                {selectedProgram ? 'Edit Program' : 'Create Program'}
              </h2>
              <div className="flex space-x-2">
                <button
                  onClick={handleSaveProgram}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>Save</span>
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditingProgram({});
                    setSelectedProgram(null);
                  }}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </button>
              </div>
            </div>

            {/* Program Details */}
            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Program Name
                </label>
                <input
                  type="text"
                  value={editingProgram.name || ''}
                  onChange={(e) => setEditingProgram({ ...editingProgram, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={editingProgram.description || ''}
                  onChange={(e) => setEditingProgram({ ...editingProgram, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  General Instructions
                </label>
                <textarea
                  value={editingProgram.instructions || ''}
                  onChange={(e) => setEditingProgram({ ...editingProgram, instructions: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Pages */}
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-800">Pages</h3>
                <button
                  onClick={addPage}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm flex items-center space-x-1 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Page</span>
                </button>
              </div>

              {editingProgram.pages?.map(page => (
                <div key={page.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-lg font-medium text-gray-800">Page {page.pageNumber}</h4>
                    <button
                      onClick={() => deletePage(page.id)}
                      className="text-red-600 hover:text-red-700 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Page Instructions
                      </label>
                      <textarea
                        value={page.instructions}
                        onChange={(e) => updatePage(page.id, { instructions: e.target.value })}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    {/* Videos section */}
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <h5 className="font-medium text-gray-700">Videos</h5>
                        <button
                          onClick={() => addVideoToPage(page.id)}
                          className="text-blue-600 hover:text-blue-700 text-sm flex items-center space-x-1 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add Video</span>
                        </button>
                      </div>
                      <div className="space-y-3">
                        {page.videos.map((video) => (
                          <div key={video.id} className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                            {/* Video title/description section */}
                            <div className="flex justify-between items-start">
                              <h4 className="font-semibold text-gray-800">
                                {video.name || 'Untitled Video'}
                              </h4>
                              <div className="flex space-x-2">
                                {!video.url && (
                                  <div className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                                    Needs video
                                  </div>
                                )}
                                <button
                                  onClick={() => deleteVideo(page.id, video.id)}
                                  className="text-red-500 hover:text-red-700"
                                  title="Delete video"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            {/* Video URL Input */}
                            <div className="flex items-center space-x-2">
                              <VideoIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                              <input
                                type="text"
                                value={video.url || ''}
                                onChange={(e) => updateVideo(page.id, video.id, { url: e.target.value })}
                                placeholder="Video URL"
                                className="flex-1 text-sm border rounded px-2 py-1"
                              />
                            </div>

                            {/* Video Uploader */}
                            {!video.url && (
                              <div className="mt-2">
                                <p className="text-xs text-gray-500 mb-1">Or upload a video:</p>
                                <VideoUploader
                                  onUploadComplete={(url) => {
                                    handleVideoUpload(page.id, video.id, url);
                                  }}
                                  folderPath={`programs/${editingProgram.id}/videos`}
                                />
                              </div>
                            )}

                            {video.url && (
                              <div className="mt-2">
                                <div className="text-xs text-green-600 flex items-center">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Video uploaded successfully
                                </div>
                                <div id="videoPlayer" className="mt-1">
                                  <video
                                    src={video.url}
                                    controls
                                    className="max-w-full h-auto rounded border border-gray-200"
                                  />
                                </div>
                              </div>
                            )}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <input
                                type="text"
                                placeholder="Video name"
                                value={video.name}
                                onChange={(e) => updateVideo(page.id, video.id, { name: e.target.value })}
                                className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                              />
                              <input
                                type="url"
                                placeholder="Video URL"
                                value={video.url}
                                onChange={(e) => updateVideo(page.id, video.id, { url: e.target.value })}
                                className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                              />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                              <input
                                type="url"
                                placeholder="Download URL (optional)"
                                value={video.downloadUrl || ''}
                                onChange={(e) => updateVideo(page.id, video.id, { downloadUrl: e.target.value })}
                                className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                              />
                              <input
                                type="text"
                                placeholder="Download filename (optional)"
                                value={video.downloadFileName || ''}
                                onChange={(e) => updateVideo(page.id, video.id, { downloadFileName: e.target.value })}
                                className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                              />
                            </div>
                            <textarea
                              placeholder="Video description"
                              value={video.description}
                              onChange={(e) => updateVideo(page.id, video.id, { description: e.target.value })}
                              rows={2}
                              className="w-full mt-3 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Programs</h2>
              {programs.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No programs created yet</p>
                  <p className="text-gray-400 text-sm mt-2">Create your first meditation program</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {programs.map(program => (
                    <div
                      key={program.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div>
                        <h3 className="font-semibold text-gray-800">{program.name}</h3>
                        <p className="text-gray-600 text-sm mt-1">{program.description}</p>
                        <p className="text-gray-500 text-xs mt-2">{program.pages.length} pages</p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditProgram(program)}
                          className="text-blue-600 hover:text-blue-700 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProgram(program.id)}
                          className="text-red-600 hover:text-red-700 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};