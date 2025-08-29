import React, { useEffect } from 'react';
import { usePaginatedApi } from '../hooks/useApi';
import { ProjectsService } from '../services/apiService';
import { Project } from '../types';
import { ApiErrorDisplay } from './ApiErrorDisplay';

export const ProjectsList: React.FC = () => {
  const {
    data: projects,
    pagination,
    loading,
    error,
    fetchData,
    refresh,
    loadMore
  } = usePaginatedApi(ProjectsService.getAll, { page: 1, limit: 10 });

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading && !projects) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Завантаження проектів...</span>
      </div>
    );
  }

  if (error) {
    return (
      <ApiErrorDisplay
        error={error}
        onRetry={refresh}
        className="m-4"
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Проекти</h2>
        <button
          onClick={refresh}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Оновлення...' : 'Оновити'}
        </button>
      </div>

      {projects && projects.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project: Project) => (
            <ProjectCard key={project.project_id} project={project} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          Проекти не знайдено
        </div>
      )}

      {pagination && pagination.page < pagination.totalPages && (
        <div className="text-center">
          <button
            onClick={loadMore}
            disabled={loading}
            className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50"
          >
            {loading ? 'Завантаження...' : 'Завантажити ще'}
          </button>
        </div>
      )}

      {pagination && (
        <div className="text-center text-sm text-gray-500">
          Сторінка {pagination.page} з {pagination.totalPages} 
          (всього: {pagination.total})
        </div>
      )}
    </div>
  );
};

const ProjectCard: React.FC<{ project: Project }> = ({ project }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {project.name}
        </h3>
        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
          {project.forecast_amount.toLocaleString('uk-UA')} грн
        </span>
      </div>
      
      {project.description && (
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {project.description}
        </p>
      )}

      <div className="space-y-2 text-sm text-gray-500">
        {project.main_responsible_manager_id && (
          <div>
            <span className="font-medium">Відповідальний:</span> 
            <span className="ml-1">ID: {project.main_responsible_manager_id}</span>
          </div>
        )}
        
        {project.counterparty_id && (
          <div>
            <span className="font-medium">Контрагент:</span> 
            <span className="ml-1">ID: {project.counterparty_id}</span>
          </div>
        )}

        {project.funnel_id && (
          <div>
            <span className="font-medium">Воронка:</span> 
            <span className="ml-1">ID: {project.funnel_id}</span>
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex justify-between text-xs text-gray-400">
          <span>Створено: {new Date().toLocaleDateString('uk-UA')}</span>
          <span>ID: {project.project_id}</span>
        </div>
      </div>
    </div>
  );
};
