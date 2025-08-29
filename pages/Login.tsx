import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../src/contexts/AuthContext';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login, isLoading } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        try {
            await login(email, password);
            navigate('/');
        } catch (err: any) {
            setError(err.message || 'Помилка входу в систему. Перевірте email та пароль.');
        }
    };

    return (
        <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center">
                    <div className="h-12 w-12 bg-[var(--brand-primary)] rounded-lg flex items-center justify-center">
                        <span className="text-white text-xl font-bold">CRM</span>
                    </div>
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-[var(--text-primary)]">
                    Вхід у систему CRM
                </h2>
                <p className="mt-2 text-center text-sm text-[var(--text-secondary)]">
                    Введіть ваші облікові дані для доступу
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="glass-pane py-8 px-4 shadow-xl sm:rounded-lg sm:px-10">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-[var(--text-primary)]">
                                Email
                            </label>
                            <div className="mt-1">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="glass-input appearance-none block w-full px-3 py-2 rounded-md shadow-sm placeholder-gray-400 focus:outline-none sm:text-sm"
                                    placeholder="your.email@example.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-[var(--text-primary)]">
                                Пароль
                            </label>
                            <div className="mt-1">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="glass-input appearance-none block w-full px-3 py-2 rounded-md shadow-sm placeholder-gray-400 focus:outline-none sm:text-sm"
                                    placeholder="Введіть пароль"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="rounded-md bg-red-500/20 p-4 border border-red-500/50">
                                <div className="flex">
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-red-400">
                                            {error}
                                        </h3>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[var(--brand-primary)] hover:bg-[var(--brand-bg-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--brand-primary)] disabled:opacity-50 transition-colors duration-300"
                            >
                                {isLoading ? 'Вхід...' : 'Увійти'}
                            </button>
                        </div>

                        <div className="text-center">
                            <p className="text-sm text-[var(--text-secondary)]">
                                Тестові облікові дані:
                            </p>
                            <div className="mt-2 text-xs text-[var(--text-muted)] space-y-1">
                                <p><strong>Адмін:</strong> admin@example.com / admin123</p>
                                <p><strong>Керівник:</strong> ivan.p@example.com / head123</p>
                                <p><strong>Менеджер:</strong> maria.i@example.com / manager123</p>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;