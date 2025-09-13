// Утилітні функції для роботи з токенами авторизації

export const setAuthToken = (token: string) => {
  // Зберігаємо токен в localStorage
  localStorage.setItem('authToken', token);
  
  // Зберігаємо токен в cookies для middleware
  const expires = new Date();
  expires.setDate(expires.getDate() + 7); // Токен дійсний 7 днів
  document.cookie = `auth_token=${token}; expires=${expires.toUTCString()}; path=/; secure; samesite=strict`;
};

export const getAuthToken = (): string | null => {
  // Спочатку шукаємо в localStorage
  let token = localStorage.getItem('authToken');
  
  if (!token && typeof document !== 'undefined') {
    // Якщо в localStorage немає, шукаємо в cookies
    const cookies = document.cookie.split(';');
    const authCookie = cookies.find(cookie => cookie.trim().startsWith('auth_token='));
    if (authCookie) {
      token = authCookie.split('=')[1];
      // Синхронізуємо з localStorage
      localStorage.setItem('authToken', token);
    }
  }
  
  return token;
};

export const removeAuthToken = () => {
  // Видаляємо з localStorage
  localStorage.removeItem('authToken');
  
  // Видаляємо з cookies
  if (typeof document !== 'undefined') {
    document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  }
};

export const isTokenExpired = (token: string): boolean => {
  try {
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      return true; // Не JWT токен
    }
    
    const payload = JSON.parse(atob(tokenParts[1]));
    
    if (!payload.exp) {
      return false; // Немає часу закінчення
    }
    
    const expDate = new Date(payload.exp * 1000);
    const now = new Date();
    
    return expDate <= now;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true; // У випадку помилки вважаємо токен недійсним
  }
};

export const redirectToLogin = () => {
  removeAuthToken();
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
};