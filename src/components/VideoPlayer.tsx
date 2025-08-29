import React, { useEffect } from 'react';
import { Video } from '../types';

interface VideoPlayerProps {
  video: Video;
  className?: string;
  onEnded?: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  video,
  className,
  onEnded
}) => {
  useEffect(() => {
    console.log('Video URL changed:', video.url);
  }, [video.url]);

  return (
    <video
      src={video.url}
      controls
      className={className}
      onEnded={onEnded}
      style={{ width: '100%', maxHeight: '400px' }}
    />
  );
};