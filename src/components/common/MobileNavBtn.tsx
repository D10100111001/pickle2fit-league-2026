import React from 'react';

interface MobileNavBtnProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

const MobileNavBtn: React.FC<MobileNavBtnProps> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`flex-1 py-3 flex flex-col items-center gap-1 transition-all ${
      active ? 'text-lime-400' : 'text-slate-500'
    }`}
  >
    {icon}
    <span className="text-xs font-medium">{label}</span>
  </button>
);

export default MobileNavBtn;
