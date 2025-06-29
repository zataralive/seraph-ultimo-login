import React, { useEffect, useState } from 'react';

interface NarrativeDisplayProps {
  message: string;
}

const NarrativeDisplay: React.FC<NarrativeDisplayProps> = ({ message }) => {
  const [visible, setVisible] = useState(false);
  const [currentMessage, setCurrentMessage] = useState("");

  useEffect(() => {
    if (message) {
      setCurrentMessage(message); // Update message immediately
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
      }, 3500); // Display message for 3.5 seconds
      return () => clearTimeout(timer);
    } else {
      setVisible(false); // Hide if message is cleared externally
    }
  }, [message]);


  return (
    <div 
        className={`fixed bottom-16 left-1/2 -translate-x-1/2 frutiger-glass px-5 py-3 rounded-xl shadow-lg text-neon-cyan text-sm z-30 transition-all duration-500 ease-out transform ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'} select-none`}
    >
      {currentMessage}
    </div>
  );
};

export default NarrativeDisplay;