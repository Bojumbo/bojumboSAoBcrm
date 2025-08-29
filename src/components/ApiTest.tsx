import React, { useState } from 'react';
import { AuthService, ProjectsService, ManagersService } from '../services/apiService';
import { ApiErrorDisplay } from './ApiErrorDisplay';

export const ApiTest: React.FC = () => {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const clearResults = () => {
    setTestResults([]);
    setError(null);
  };

  const testAuth = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      addResult('Тестування аутентифікації...');
      
      // Тест логіну
      const loginResponse = await AuthService.login({
        email: 'admin@example.com',
        password: 'admin123'
      });
      
      addResult(`✅ Логін успішний: ${loginResponse.user.email}`);
      
      // Тест отримання поточного користувача
      const currentUser = await AuthService.getCurrentUser();
      addResult(`✅ Поточний користувач: ${currentUser.email}`);
      
      // Тест логауту
      await AuthService.logout();
      addResult('✅ Логаут успішний');
      
    } catch (err: any) {
      const errorMsg = err.message || 'Невідома помилка';
      addResult(`❌ Помилка аутентифікації: ${errorMsg}`);
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const testProjects = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      addResult('Тестування API проектів...');
      
      const projects = await ProjectsService.getAll();
      addResult(`✅ Проекти завантажено: ${projects.data.length} проектів`);
      
      if (projects.data.length > 0) {
        const firstProject = projects.data[0];
        addResult(`📋 Перший проект: ${firstProject.name} (ID: ${firstProject.project_id})`);
      }
      
    } catch (err: any) {
      const errorMsg = err.message || 'Невідома помилка';
      addResult(`❌ Помилка завантаження проектів: ${errorMsg}`);
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const testManagers = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      addResult('Тестування API менеджерів...');
      
      const managers = await ManagersService.getAll();
      addResult(`✅ Менеджери завантажено: ${managers.data.length} менеджерів`);
      
      if (managers.data.length > 0) {
        const firstManager = managers.data[0];
        addResult(`👤 Перший менеджер: ${firstManager.first_name} ${firstManager.last_name} (${firstManager.role})`);
      }
      
    } catch (err: any) {
      const errorMsg = err.message || 'Невідома помилка';
      addResult(`❌ Помилка завантаження менеджерів: ${errorMsg}`);
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const testAll = async () => {
    clearResults();
    addResult('🚀 Початок комплексного тестування API...');
    
    await testAuth();
    await testProjects();
    await testManagers();
    
    addResult('🏁 Тестування завершено!');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Тестування API з'єднання
        </h2>
        
        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={testAll}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Тестування...' : 'Тестувати все'}
          </button>
          
          <button
            onClick={testAuth}
            disabled={isLoading}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            Тест аутентифікації
          </button>
          
          <button
            onClick={testProjects}
            disabled={isLoading}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
          >
            Тест проектів
          </button>
          
          <button
            onClick={testManagers}
            disabled={isLoading}
            className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50"
          >
            Тест менеджерів
          </button>
          
          <button
            onClick={clearResults}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Очистити
          </button>
        </div>

        {error && (
          <ApiErrorDisplay
            error={error}
            onDismiss={() => setError(null)}
            className="mb-4"
          />
        )}

        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            Результати тестування:
          </h3>
          
          {testResults.length === 0 ? (
            <p className="text-gray-500 italic">
              Натисніть кнопку "Тестувати все" для початку тестування
            </p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className={`text-sm font-mono ${
                    result.includes('✅') ? 'text-green-700' :
                    result.includes('❌') ? 'text-red-700' :
                    result.includes('📋') || result.includes('👤') ? 'text-blue-700' :
                    'text-gray-700'
                  }`}
                >
                  {result}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
