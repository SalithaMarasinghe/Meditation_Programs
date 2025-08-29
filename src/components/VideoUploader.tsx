import React, { useState } from 'react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../config/firebase';
import { Upload, CheckCircle } from 'lucide-react';

interface VideoUploaderProps {
  onUploadComplete: (url: string) => void;
  folderPath?: string;
}

export const VideoUploader: React.FC<VideoUploaderProps> = ({ 
  onUploadComplete,
  folderPath = 'videos' 
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [uploadComplete, setUploadComplete] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if file is a video
    if (!file.type.startsWith('video/')) {
      setError('Please upload a valid video file');
      return;
    }

    const storageRef = ref(storage, `${folderPath}/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    setIsUploading(true);
    setError(null);
    setUploadComplete(false);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setProgress(progress);
      },
      (error) => {
        console.error('Upload failed:', error);
        setError('Upload failed. Please try again.');
        setIsUploading(false);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        onUploadComplete(downloadURL);
        setIsUploading(false);
        setUploadComplete(true);
        
        // Reset status after 3 seconds
        setTimeout(() => {
          setUploadComplete(false);
          setProgress(0);
        }, 3000);
      }
    );
  };

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
        <label className="cursor-pointer flex flex-col items-center space-y-2">
          {isUploading ? (
            <div className="w-full">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="mt-2 text-sm text-gray-600">
                Uploading... {Math.round(progress)}%
              </p>
            </div>
          ) : uploadComplete ? (
            <div className="flex flex-col items-center text-green-600">
              <CheckCircle className="w-10 h-10 mb-2" />
              <p>Upload Complete!</p>
            </div>
          ) : (
            <>
              <Upload className="w-10 h-10 text-gray-400" />
              <p className="text-sm text-gray-600">
                <span className="font-medium text-blue-600">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500">
                MP4, WebM, or MOV (max. 100MB)
              </p>
            </>
          )}
          <input
            type="file"
            className="hidden"
            accept="video/mp4,video/webm,video/quicktime"
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </label>
      </div>
      
      {error && (
        <div className="text-red-600 text-sm text-center">
          {error}
        </div>
      )}
    </div>
  );
};
