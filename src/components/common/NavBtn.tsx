import React from 'react';

interface NavBtnProps {
  active: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

const NavBtn: React.FC<NavBtnProps> = ({ active, onClick, icon, children }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
      active
        ? 'text-lime-400 bg-lime-400/10'
        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
    }`}
  >
    {icon}
    {children}
  </button>
);

export default NavBtn;
