
import React from 'react';
import { Link } from 'react-router-dom';

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className = '' }) => {
  return (
    <Link to="/" className={`flex items-center gap-2 ${className}`}>
      <div className="relative h-10 w-10 overflow-hidden">
        <div className="absolute inset-0 bg-pwga-green rounded-full opacity-90"></div>
        <div className="absolute inset-1 flex items-center justify-center text-white font-bold">
          <span className="text-xs tracking-tighter">PWGA</span>
        </div>
      </div>
      <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-pwga-green to-pwga-blue">
        PWGA
      </span>
    </Link>
  );
};

export default Logo;
