import { useState } from 'react';
import { Resource } from '../types';
import { Trash2, Download, Upload } from 'lucide-react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../config/firebase';

interface ResourceManagerProps {
  resources: Resource[];
  onDelete: (index: number) => void;
  folderPath: string;
  onUpload: (url: string, name: string) => void;
}

export const ResourceManager = ({
  resources = [],
  onDelete,
  folderPath,
  onUpload,
}: ResourceManagerProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [resourceName, setResourceName] = useState('');

  const allowedTypes = ['pdf', 'doc', 'docx', 'txt', 'jpg', 'jpeg', 'png', 'gif', 'zip'];

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileName = resourceName || file.name.replace(/\.[^/.]+$/, ''); // Remove file extension
    const fileExt = file.name.split('.').pop()?.toLowerCase() || '';

    if (!allowedTypes.includes(fileExt)) {
      setError('File type not allowed. Please upload a PDF, DOC, TXT, or image file.');
      return;
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
          onUpload(downloadURL, fileName);
          setResourceName('');
          setIsUploading(false);
          setUploadProgress(0);
        }
      );
    } catch (error) {
      console.error('Error uploading file:', error);
      setError('An error occurred while uploading the file.');
      setIsUploading(false);
    }
  };
  const handleDownload = (url: string, name: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">Resources</h3>
        <div className="relative">
          <input
            type="text"
            value={resourceName}
            onChange={(e) => setResourceName(e.target.value)}
            placeholder="Resource name"
            className="mr-2 px-3 py-1 border border-gray-300 rounded-md text-sm"
            disabled={isUploading}
          />
          <label 
            className={`inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            htmlFor="resource-upload"
          >
            <Upload className="w-4 h-4 mr-1" />
            Upload
          </label>
          <input
            id="resource-upload"
            type="file"
            className="hidden"
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </div>
      </div>
      
      {error && (
        <div className="mb-4 p-2 text-sm text-red-600 bg-red-50 rounded-md">
          {error}
        </div>
      )}
      
      {isUploading && (
        <div className="mb-4">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-blue-600 h-2.5 rounded-full" 
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-1">Uploading... {Math.round(uploadProgress)}%</p>
        </div>
      )}
      
      <div className="space-y-2">
        {resources.map((resource, index) => (
          <div
            key={index}
            className="flex justify-between items-center p-3 bg-gray-50 rounded-md"
          >
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">
                {resource.name} <span className="text-xs text-gray-400">({resource.type})</span>
              </span>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handleDownload(resource.url, resource.name)}
                className="text-blue-600 hover:text-blue-800"
                title="Download"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(index)}
                className="text-red-600 hover:text-red-800"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
