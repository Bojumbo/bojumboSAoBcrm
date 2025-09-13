'use client';

import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, Paperclip, Upload, X, File } from 'lucide-react';
import { UploadService } from '@/services/uploadService';
import { cn } from '@/lib/utils';

interface SimpleFileUploadProps {
  onFileSelect?: (file: File | null) => void;
  onFileUpload?: (result: { fileName: string; fileUrl: string; fileType: string }) => void;
  className?: string;
  allowedTypes?: string[];
  disabled?: boolean;
  buttonText?: string;
  buttonVariant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
}

export function SimpleFileUpload({
  onFileSelect,
  onFileUpload,
  className,
  allowedTypes,
  disabled = false,
  buttonText = "Прикріпити файл",
  buttonVariant = "outline",
}: SimpleFileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (file: File) => {
    setError(null);
    
    // Діагностика авторизації
    const authStatus = UploadService.checkAuthStatus();
    console.log('Auth status:', authStatus);
    
    if (!authStatus.hasToken) {
      setError('Не знайдено токен авторизації. Спробуйте увійти в систему знову.');
      return;
    }
    
    // Валідація типу файлу
    if (allowedTypes && !UploadService.validateFileType(file, allowedTypes)) {
      setError('Непідтримуваний тип файлу');
      return;
    }

    setSelectedFile(file);
    onFileSelect?.(file);

    // Автоматичне завантаження файлу
    await handleUpload(file);
  };

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    setError(null);

    try {
      console.log('Starting file upload:', file.name);
      const result = await UploadService.uploadFile(file);
      console.log('Upload successful:', result);
      onFileUpload?.(result);
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Помилка завантаження файлу';
      setError(errorMessage);
      
      // Якщо помилка пов'язана з авторизацією, можливо, потрібно перенаправити на логін
      if (errorMessage.includes('авторизації') || errorMessage.includes('401')) {
        setError('Потрібно увійти в систему для завантаження файлів');
      }
    } finally {
      setIsUploading(false);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setError(null);
    onFileSelect?.(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const openFileDialog = () => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      {/* Кнопка вибору файлу */}
      <Button
        type="button"
        variant={buttonVariant}
        size="sm"
        onClick={openFileDialog}
        disabled={disabled || isUploading}
        className="w-auto"
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleInputChange}
          className="hidden"
          disabled={disabled}
          accept={allowedTypes?.join(',')}
        />
        {isUploading ? (
          <>
            <Upload className="w-4 h-4 mr-2 animate-spin" />
            Завантажую...
          </>
        ) : (
          <>
            <Paperclip className="w-4 h-4 mr-2" />
            {buttonText}
          </>
        )}
      </Button>

      {/* Помилка */}
      {error && (
        <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-2 rounded text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Відображення вибраного файлу */}
      {selectedFile && !error && (
        <div className="flex items-center justify-between p-2 bg-gray-50 border border-gray-200 rounded text-sm">
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            <span className="text-base flex-shrink-0">
              {UploadService.getFileIcon(selectedFile.name)}
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{selectedFile.name}</p>
              <p className="text-gray-500 text-xs">
                {UploadService.formatFileSize(selectedFile.size)}
              </p>
            </div>
          </div>
          
          {!isUploading && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFile}
              className="flex-shrink-0 h-6 w-6 p-0 text-gray-400 hover:text-red-600"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export default SimpleFileUpload;