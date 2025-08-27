import React from 'react';

interface PageHeaderProps {
  title: string;
  buttonLabel?: string;
  onButtonClick?: () => void;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, buttonLabel, onButtonClick }) => {
  return (
    <div className="flex items-center justify-between mb-8">
      <h1 className="text-3xl font-bold text-[var(--text-primary)]" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>{title}</h1>
      {buttonLabel && onButtonClick && (
        <button
          onClick={onButtonClick}
          className="sheen-effect inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium text-white bg-[var(--brand-bg-translucent)] border border-[var(--brand-border-translucent)] rounded-lg shadow-lg backdrop-blur-sm hover:bg-[var(--brand-bg-hover)] hover:scale-105 transform transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500"
        >
          {buttonLabel}
        </button>
      )}
    </div>
  );
};

export default PageHeader;