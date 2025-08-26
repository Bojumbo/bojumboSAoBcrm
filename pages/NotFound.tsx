
import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <h1 className="text-6xl font-bold text-indigo-600">404</h1>
      <h2 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl">Сторінку не знайдено</h2>
      <p className="mt-6 text-base leading-7 text-gray-600 dark:text-gray-300">На жаль, ми не змогли знайти сторінку, яку ви шукаєте.</p>
      <div className="mt-10 flex items-center justify-center gap-x-6">
        <Link
          to="/"
          className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Повернутися на головну
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
