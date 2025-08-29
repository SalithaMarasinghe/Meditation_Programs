import React, { useState, useRef, ChangeEvent } from 'react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../config/firebase';
import { Upload, File, Download, Trash2, FileArchive, FileText, FileImage } from 'lucide-react';

interface ResourceUploaderProps {
  onUploadComplete: (url: string, name: string) => void;
  folderPath?: string;
  existingResources?: Array<{ name: string; url: string }>;
  onDeleteResource?: (index: number) => void;
}

export const ResourceUploader: React.FC<ResourceUploaderProps> = ({ 
  onUploadComplete,
  folderPath = 'resources',
  existingResources = [],
  onDeleteResource
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [resourceName, setResourceName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'zip':
      case 'rar':
      case '7z':
        return <FileArchive className="w-4 h-4 text-yellow-500" />;
      case 'pdf':
        return <FileText className="w-4 h-4 text-red-500" />;
      case 'doc':
      case 'docx':
        return <FileText className="w-4 h-4 text-blue-500" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <FileImage className="w-4 h-4 text-green-500" />;
      default:
        return <File className="w-4 h-4 text-gray-500" />;
    }
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Get file extension in lowercase
    const fileExt = file.name.split('.').pop()?.toLowerCase() || '';
    const fileName = resourceName || file.name.replace(/\.[^/.]+$/, '');
    
    // List of allowed file extensions
    const allowedExtensions = ['pdf', 'doc', 'docx', 'txt', 'jpg', 'jpeg', 'png', 'zip'];
    
    // Check file extension
    if (!allowedExtensions.includes(fileExt)) {
      setError('File type not allowed. Please upload a PDF, DOC, DOCX, TXT, JPG, JPEG, PNG, or ZIP file.');
      return;
    }
    
    // If it's a ZIP file, bypass MIME type check as it can be inconsistent across browsers
    if (fileExt === 'zip') {
      // Proceed with ZIP file upload
    } else {
      // For other files, do a basic MIME type check
      const allowedMimeTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'image/jpeg',
        'image/png'
      ];
      
      if (!file.type || !allowedMimeTypes.some(type => file.type.includes(type.replace('*', '')))) {
        setError('Invalid file type. Please upload a valid file.');
        return;
      }
    }

    setIsUploading(true);
    setError('');
    setUploadProgress(0);

    try {
      const storageRef = ref(storage, `${folderPath}/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          console.error('Upload failed:', error);
          setError('Upload failed. Please try again.');
          setIsUploading(false);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          onUploadComplete(downloadURL, fileName);
          setResourceName('');
          setIsUploading(false);
          setUploadProgress(0);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }
      );
    } catch (error) {
      console.error('Error uploading file:', error);
      setError('An error occurred while uploading the file.');
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Resource Name
          </label>
          <input
            type="text"
            placeholder="Resource name (optional)"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={resourceName}
            onChange={(e) => setResourceName(e.target.value)}
            disabled={isUploading}
          />
        </div>
        <label className="flex-shrink-0 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md cursor-pointer hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
               aria-busy={isUploading}>
          <Upload className="w-4 h-4 mr-2" />
          {isUploading ? 'Uploading...' : 'Choose File'}
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.zip"
            disabled={isUploading}
          />
        </label>
      </div>
      
      {isUploading && (
        <div className="mt-2">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Uploading... {Math.round(uploadProgress)}%
          </p>
        </div>
      )}

      {error && (
        <div className="p-3 text-sm text-red-700 bg-red-100 rounded-md">
          {error}
        </div>
      )}

      {existingResources.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Uploaded Resources</h4>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
            {existingResources.map((resource, index) => (
              <div key={index} className="flex items-center justify-between bg-white border border-gray-200 p-3 rounded-md hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-3 min-w-0">
                  {getFileIcon(resource.name)}
                  <span className="text-sm font-medium text-gray-800 truncate" title={resource.name}>
                    {resource.name}
                  </span>
                </div>
                <div className="flex space-x-2 ml-3">
                  <a
                    href={resource.url}
                    download
                    className="p-1.5 text-gray-500 hover:text-blue-600 rounded-full hover:bg-blue-50 transition-colors"
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                  {onDeleteResource && (
                    <button
                      onClick={() => onDeleteResource(index)}
                      className="p-1.5 text-gray-500 hover:text-red-600 rounded-full hover:bg-red-50 transition-colors"
                      title="Delete"
                      disabled={isUploading}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
