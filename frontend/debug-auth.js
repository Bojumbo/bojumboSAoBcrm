// Тестовий скрипт для перевірки авторизації
// Додайте цей код в консоль браузера для перевірки токена

const checkAuthToken = () => {
  const token = localStorage.getItem('authToken');
  console.log('Auth token:', token ? 'Present' : 'Not found');
  
  if (token) {
    try {
      // Спробуємо розпарсити JWT токен (якщо він у форматі JWT)
      const tokenParts = token.split('.');
      if (tokenParts.length === 3) {
        const payload = JSON.parse(atob(tokenParts[1]));
        console.log('Token payload:', payload);
        
        // Перевіримо час закінчення дії токена
        if (payload.exp) {
          const expDate = new Date(payload.exp * 1000);
          const now = new Date();
          console.log('Token expires:', expDate);
          console.log('Current time:', now);
          console.log('Token valid:', expDate > now);
        }
      }
    } catch (e) {
      console.log('Token is not JWT format or invalid');
    }
  }
  
  return token;
};

// Функція для тестування API запиту
const testProjectAPI = async (projectId = 4) => {
  const token = localStorage.getItem('authToken');
  
  if (!token) {
    console.error('No token found. Please login first.');
    return;
  }
  
  try {
    const response = await fetch(`http://localhost:3001/api/projects/${projectId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', [...response.headers.entries()]);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Project data:', data);
    } else {
      const errorText = await response.text();
      console.error('Error response:', errorText);
    }
  } catch (error) {
    console.error('Network error:', error);
  }
};

// Експортуємо функції для використання в консолі
window.checkAuthToken = checkAuthToken;
window.testProjectAPI = testProjectAPI;