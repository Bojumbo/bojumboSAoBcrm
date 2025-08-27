import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ChartBarIcon } from '../components/Icons';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const { login, loading } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        try {
            const user = await login(email);
            if (user) {
                navigate('/');
            } else {
                setError('Невірний email або користувача не знайдено.');
            }
        } catch (err) {
            setError('Сталася помилка. Спробуйте ще раз.');
        }
    };

    return (
        <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center">
                    <ChartBarIcon className="h-12 w-auto text-[var(--text-brand)]" />
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-[var(--text-primary)]">
                    Вхід у систему CRM
                </h2>
                 <p className="mt-2 text-center text-sm text-[var(--text-secondary)]">
                    Приклади: admin@example.com, ivan.p@example.com, maria.i@example.com
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="glass-pane py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-[var(--text-secondary)]">
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
                                    className="appearance-none block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none sm:text-sm glass-input"
                                    placeholder="your.email@example.com"
                                />
                            </div>
                        </div>

                        {error && <p className="text-red-400 text-sm text-center">{error}</p>}

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[var(--brand-primary)] hover:bg-[var(--brand-bg-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 disabled:opacity-50"
                            >
                                {loading ? 'Вхід...' : 'Увійти'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;