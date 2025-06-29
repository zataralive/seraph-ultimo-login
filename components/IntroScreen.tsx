
import React, { useState, useEffect } from 'react';

interface IntroScreenProps {
  paragraphs: string[];
  onEnd: () => void;
}

const IntroScreen: React.FC<IntroScreenProps> = ({ paragraphs, onEnd }) => {
  const [visibleParagraphs, setVisibleParagraphs] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showSkipButton, setShowSkipButton] = useState(false);

  useEffect(() => {
    if (currentIndex < paragraphs.length) {
      const paragraphDelay = currentIndex === 0 ? 300 : 1800;
      const timer = setTimeout(() => {
        setVisibleParagraphs(prev => [...prev, paragraphs[currentIndex]]);
        setCurrentIndex(prev => prev + 1);
        if (currentIndex >= 1 && !showSkipButton) { // Show skip button after the first couple of paragraphs
            setShowSkipButton(true);
        }
      }, paragraphDelay);
      return () => clearTimeout(timer);
    } else {
        // Ensure skip button is shown if intro finishes fast or is very short
        setShowSkipButton(true); 
    }
  }, [currentIndex, paragraphs, showSkipButton]);

  // Alternative way to show skip button early
   useEffect(() => {
    const skipButtonTimer = setTimeout(() => {
      if (currentIndex < paragraphs.length) { // Only show if intro is still running
        setShowSkipButton(true);
      }
    }, 2500); // Show skip button after 2.5 seconds regardless of paragraph progress
    return () => clearTimeout(skipButtonTimer);
  }, [currentIndex, paragraphs.length]);


  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-sky-200 to-cyan-300 dark:from-slate-800 dark:to-slate-900 p-4 md:p-8 text-slate-700 dark:text-slate-200 text-center custom-scrollbar overflow-y-auto">
      <div className="max-w-3xl space-y-4 frutiger-glass p-6 md:p-12 rounded-2xl shadow-xl relative"> {/* Added relative for skip button positioning */}
        {visibleParagraphs.map((p, index) => (
          <p 
            key={index} 
            className={`animate-fadeInDrop ${
              index === 0 
              ? 'text-3xl md:text-4xl font-semibold text-sky-600 dark:text-neon-cyan mb-3' 
              : 'text-base md:text-lg leading-relaxed text-slate-600 dark:text-slate-300'
            }`}
            style={{animationDelay: `${index * 0.1}s`}}
          >
            {p}
          </p>
        ))}
      </div>
      {currentIndex >= paragraphs.length && (
        <button
          onClick={onEnd}
          className="mt-10 frutiger-button-neon text-lg md:text-xl px-8 md:px-10 py-3 md:py-3.5 animate-fadeIn"
          style={{ animationDelay: '0.5s' }}
        >
          Inicializar Sistema
        </button>
      )}
      {showSkipButton && currentIndex < paragraphs.length && (
         <button
          onClick={onEnd}
          className="mt-6 frutiger-button text-sm px-6 py-2 opacity-80 hover:opacity-100 animate-fadeIn"
          style={{ animationDelay: '0.2s' }}
          aria-label="Pular Introdução"
        >
          Pular Introdução
        </button>
      )}
      <style>{`
        @keyframes fadeInDrop {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInDrop { animation: fadeInDrop 0.8s ease-out forwards; }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn { animation: fadeIn 1s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default IntroScreen;