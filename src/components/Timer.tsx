import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Bell, BellOff } from 'lucide-react';

export const Timer: React.FC = () => {
  const [minutes, setMinutes] = useState<number>(30);
  const [seconds, setSeconds] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const bellSoundRef = useRef<HTMLAudioElement | null>(null);

  // Initialize the audio element
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Use the correct path to the bell sound in the public directory
      bellSoundRef.current = new Audio(`${import.meta.env.BASE_URL}bell.mp3`);
      // Preload the audio
      const loadPromise = bellSoundRef.current.load();
      if (loadPromise !== undefined) {
        loadPromise.catch((error: Error) => {
          console.error('Error loading bell sound:', error);
        });
      }
    }
    
    return () => {
      if (bellSoundRef.current) {
        bellSoundRef.current.pause();
        bellSoundRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive) {
      interval = setInterval(() => {
        setSeconds((prevSeconds) => {
          if (prevSeconds === 0) {
            if (minutes === 0) {
              // Timer has reached zero
              clearInterval(interval as NodeJS.Timeout);
              playBellSound();
              setIsActive(false);
              return 0;
            }
            setMinutes((prevMinutes) => prevMinutes - 1);
            return 59;
          }
          return prevSeconds - 1;
        });
      }, 1000);
    } else if (!isActive && seconds !== 0 && interval) {
      clearInterval(interval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, minutes, seconds, isMuted]);

  const playBellSound = () => {
    if (isMuted || !bellSoundRef.current) return;
    
    try {
      // Reset the audio to the beginning in case it's already playing
      bellSoundRef.current.currentTime = 0;
      
      // Play the sound
      const playPromise = bellSoundRef.current.play();
      
      // Handle any potential play() errors
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error('Error playing bell sound:', error);
        });
      }
    } catch (error) {
      console.error('Error playing bell sound:', error);
    }
  };

  const toggleTimer = () => {
    if (!isActive && minutes === 0 && seconds === 0) {
      // Don't start if time is 00:00
      return;
    }
    
    if (isActive && minutes === 0 && seconds === 0) {
      // Timer just ended, play sound
      playBellSound();
    }
    
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setMinutes(30);
    setSeconds(0);
    setIsActive(false);
    if (bellSoundRef.current) {
      bellSoundRef.current.pause();
      bellSoundRef.current.currentTime = 0;
    }
  };

  const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10) || 0;
    if (value >= 0 && value <= 999) {
      setMinutes(value);
    }
  };

  const handleSecondsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10) || 0;
    if (value >= 0 && value <= 59) {
      setSeconds(value);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const formatTime = (time: number) => {
    return time.toString().padStart(2, '0');
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Meditation Timer</h3>
      
      <div className="flex items-center justify-center space-x-4 mb-6">
        <div className="flex flex-col items-center">
          <label className="text-sm text-gray-600 mb-1">Minutes</label>
          <input
            type="number"
            min="0"
            max="999"
            value={minutes}
            onChange={handleMinutesChange}
            className="w-20 text-center text-4xl font-mono border-b-2 border-gray-300 focus:outline-none focus:border-blue-500"
            disabled={isActive}
          />
        </div>
        <span className="text-4xl font-mono pt-6">:</span>
        <div className="flex flex-col items-center">
          <label className="text-sm text-gray-600 mb-1">Seconds</label>
          <input
            type="number"
            min="0"
            max="59"
            value={formatTime(seconds)}
            onChange={handleSecondsChange}
            className="w-20 text-center text-4xl font-mono border-b-2 border-gray-300 focus:outline-none focus:border-blue-500"
            disabled={isActive}
          />
        </div>
      </div>

      <div className="flex justify-center space-x-4">
        <button
          onClick={toggleTimer}
          className={`flex items-center justify-center w-12 h-12 rounded-full ${
            isActive ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
          } text-white transition-colors`}
          title={isActive ? 'Pause' : 'Start'}
        >
          {isActive ? <Pause size={20} /> : <Play size={20} className="ml-1" />}
        </button>
        
        <button
          onClick={resetTimer}
          className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 transition-colors"
          title="Reset"
        >
          <RotateCcw size={20} />
        </button>
        
        <button
          onClick={toggleMute}
          className={`flex items-center justify-center w-12 h-12 rounded-full ${
            isMuted ? 'bg-gray-200' : 'bg-blue-100'
          } text-blue-600 hover:bg-blue-200 transition-colors`}
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <BellOff size={20} /> : <Bell size={20} />}
        </button>
      </div>

      {/* No external audio element needed - using Web Audio API */}
    </div>
  );
};
