
import React from 'react';

interface PageHeaderProps {
  title: string;
  buttonLabel?: string;
  onButtonClick?: () => void;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, buttonLabel, onButtonClick }) => {
  return (
    <div className="flex items-center justify-between mb-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{title}</h1>
      {buttonLabel && onButtonClick && (
        <button
          onClick={onButtonClick}
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {buttonLabel}
        </button>
      )}
    </div>
  );
};

export default PageHeader;
