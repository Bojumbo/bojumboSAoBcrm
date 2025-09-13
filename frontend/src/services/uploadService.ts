export interface UploadResult {
  fileName: string;
  fileUrl: string;
  fileType: string;
}

export class UploadService {
  private static API_BASE_URL = 'http://localhost:3001/api';

  /**
   * Перевіряє статус авторизації
   * @returns інформацію про стан авторизації
   */
  static checkAuthStatus(): { hasToken: boolean; tokenSources: string[]; tokenValue?: string } {
    const sources: string[] = [];
    let token: string | null = null;

    // Перевіряємо localStorage
    if (localStorage.getItem('auth_token')) {
      sources.push('localStorage: auth_token');
      token = localStorage.getItem('auth_token');
    }
    if (localStorage.getItem('authToken')) {
      sources.push('localStorage: authToken');
      token = token || localStorage.getItem('authToken');
    }
    if (localStorage.getItem('token')) {
      sources.push('localStorage: token');
      token = token || localStorage.getItem('token');
    }

    // Перевіряємо cookies
    const cookies = document.cookie.split(';');
    const authCookie = cookies.find(cookie => cookie.trim().startsWith('auth_token='));
    if (authCookie) {
      sources.push('cookies: auth_token');
      token = token || authCookie.split('=')[1];
    }

    return {
      hasToken: !!token,
      tokenSources: sources,
      tokenValue: token ? `${token.substring(0, 10)}...` : undefined
    };
  }

  /**
   * Завантажує файл на сервер
   * @param file - файл для завантаження
   * @returns обіцянка з інформацією про завантажений файл
   */
  static async uploadFile(file: File): Promise<UploadResult> {
    try {
      const token = this.getAuthToken();
      console.log('Upload file - token found:', !!token);
      
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${this.API_BASE_URL}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      console.log('Upload response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Upload failed:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.error || 'Помилка завантаження файлу');
      }
    } catch (error) {
      console.error('Помилка завантаження файлу:', error);
      throw error;
    }
  }

  /**
   * Видаляє файл із сервера
   * @param fileUrl - URL файлу для видалення
   * @returns обіцянка з результатом операції
   */
  static async deleteFile(fileUrl: string): Promise<boolean> {
    try {
      const token = this.getAuthToken();
      
      const response = await fetch(`${this.API_BASE_URL}/upload`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ fileUrl }),
      });

      if (!response.ok) {
        return false;
      }

      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error('Помилка видалення файлу:', error);
      return false;
    }
  }

  /**
   * Перевіряє розмір файлу
   * @param file - файл для перевірки
   * @param maxSizeInMB - максимальний розмір в МБ (за замовчуванням без обмеження)
   * @returns true якщо файл допустимого розміру
   */
  static validateFileSize(file: File, maxSizeInMB?: number): boolean {
    if (!maxSizeInMB) return true; // Без обмеження розміру
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    return file.size <= maxSizeInBytes;
  }

  /**
   * Перевіряє тип файлу
   * @param file - файл для перевірки
   * @param allowedTypes - допустимі типи файлів
   * @returns true якщо тип файлу допустимий
   */
  static validateFileType(file: File, allowedTypes?: string[]): boolean {
    const defaultAllowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain'
    ];

    const typesToCheck = allowedTypes || defaultAllowedTypes;
    return typesToCheck.includes(file.type);
  }

  /**
   * Форматує розмір файлу для відображення
   * @param bytes - розмір в байтах
   * @returns рядок з форматованим розміром
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Отримує тип іконки для файлу
   * @param fileName - назва файлу
   * @returns рядок з іконкою
   */
  static getFileIcon(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'pdf':
        return '📄';
      case 'doc':
      case 'docx':
        return '📝';
      case 'xls':
      case 'xlsx':
        return '📊';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return '🖼️';
      case 'txt':
        return '📋';
      default:
        return '📎';
    }
  }

  /**
   * Отримує токен авторизації
   * @returns JWT токен
   */
  private static getAuthToken(): string {
    // Спробуємо кілька варіантів назв токена
    let token = localStorage.getItem('auth_token') || 
                localStorage.getItem('authToken') || 
                localStorage.getItem('token');
    
    // Також спробуємо отримати з cookies
    if (!token) {
      const cookies = document.cookie.split(';');
      const authCookie = cookies.find(cookie => cookie.trim().startsWith('auth_token='));
      if (authCookie) {
        token = authCookie.split('=')[1];
      }
    }
    
    if (!token) {
      throw new Error('Токен авторизації не знайдено. Будь ласка, увійдіть в систему знову.');
    }
    
    return token;
  }
}