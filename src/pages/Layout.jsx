
import React from 'react';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-black">
      <style>{`
        /* Tooltip z-index fix */
        [data-radix-popper-content-wrapper] {
          z-index: 999999 !important;
        }

        [data-radix-hover-card-content] {
          z-index: 999999 !important;
          position: fixed !important;
        }

        [data-radix-portal] {
          z-index: 999999 !important;
        }
        
        :root {
          --background: 222.2 84% 4.9%;
          --foreground: 210 40% 98%;
          --card: 222.2 84% 4.9%;
          --card-foreground: 210 40% 98%;
          --popover: 222.2 84% 4.9%;
          --popover-foreground: 210 40% 98%;
          --primary: 217.2 91.2% 59.8%;
          --primary-foreground: 222.2 47.4% 11.2%;
          --secondary: 217.2 32.6% 17.5%;
          --secondary-foreground: 210 40% 98%;
          --muted: 217.2 32.6% 17.5%;
          --muted-foreground: 215 20.2% 65.1%;
          --accent: 217.2 32.6% 17.5%;
          --accent-foreground: 210 40% 98%;
          --destructive: 0 62.8% 30.6%;
          --destructive-foreground: 210 40% 98%;
          --border: 217.2 32.6% 17.5%;
          --input: 217.2 32.6% 17.5%;
          --ring: 224.3 76.3% 48%;
        }
        
        * {
          scrollbar-width: thin;
          scrollbar-color: #1e293b #000000;
        }
        
        *::-webkit-scrollbar {
          width: 10px;
          height: 10px;
        }
        
        *::-webkit-scrollbar-track {
          background: #000000;
        }
        
        *::-webkit-scrollbar-thumb {
          background: #1e293b;
          border-radius: 5px;
          border: 2px solid #000000;
        }
        
        *::-webkit-scrollbar-thumb:hover {
          background: #334155;
        }
        
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
        
        input[type="range"] {
          -webkit-appearance: none;
          appearance: none;
          background: transparent;
        }
        
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          background: #3b82f6;
          border-radius: 50%;
          cursor: pointer;
          margin-top: -4px;
        }
        
        input[type="range"]::-webkit-slider-runnable-track {
          height: 8px;
          background: #1e293b;
          border-radius: 4px;
        }

        /* Remove focus outlines and cursors */
        input[type="range"]:focus {
          outline: none !important;
        }

        button:focus-visible,
        input:focus-visible,
        select:focus-visible,
        textarea:focus-visible {
          outline: none !important;
          box-shadow: none !important;
        }

        *:focus {
          outline: none !important;
        }

        [role="slider"]:focus {
          outline: none !important;
          box-shadow: none !important;
        }
      `}</style>
      {children}
    </div>
  );
}
