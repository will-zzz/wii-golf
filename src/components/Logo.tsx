
import React from 'react';
import { Link } from 'react-router-dom';

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className = '' }) => {
  return (
    <Link to="/" className={`flex items-center ${className}`}>
      <img 
        src="/lovable-uploads/6736e81b-c666-4dfa-a48d-c1fff50fb166.png" 
        alt="PWGA Logo" 
        className="h-8 md:h-10" 
      />
    </Link>
  );
};

export default Logo;
