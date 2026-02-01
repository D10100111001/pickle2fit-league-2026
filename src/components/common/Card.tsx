import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => (
  <div className={`bg-slate-800/50 backdrop-blur-md border border-white/5 rounded-2xl shadow-lg overflow-hidden ${className}`}>
    {children}
  </div>
);

export default Card;
