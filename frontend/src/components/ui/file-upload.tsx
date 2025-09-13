'use client';

import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, Paperclip, Upload, X } from 'lucide-react';
import { UploadService } from '@/services/uploadService';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onFileSelect?: (file: File | null) => void;
  onFileUpload?: (result: { fileName: string; fileUrl: string; fileType: string }) => void;
  className?: string;
  multiple?: boolean;
  maxSizeInMB?: number;
  allowedTypes?: string[];
  disabled?: boolean;
  showPreview?: boolean;
  uploadOnSelect?: boolean;
}

export function FileUpload({
  onFileSelect,
  onFileUpload,
  className,
  multiple = false,
  maxSizeInMB = 10,
  allowedTypes,
  disabled = false,
  showPreview = true,
  uploadOnSelect = false,
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (file: File) => {
    setError(null);
    
    // Валідація розміру файлу
    if (!UploadService.validateFileSize(file, maxSizeInMB)) {
      setError(`Файл завеликий. Максимальний розмір: ${maxSizeInMB}МБ`);
      return;
    }

    // Валідація типу файлу
    if (!UploadService.validateFileType(file, allowedTypes)) {
      setError('Непідтримуваний тип файлу');
      return;
    }

    setSelectedFile(file);
    onFileSelect?.(file);

    // Автоматичне завантаження, якщо увімкнено
    if (uploadOnSelect) {
      await handleUpload(file);
    }
  };

  const handleUpload = async (file?: File) => {
    const fileToUpload = file || selectedFile;
    if (!fileToUpload) return;

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      // Симуляція прогресу завантаження
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 100);

      const result = await UploadService.uploadFile(fileToUpload);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
        onFileUpload?.(result);
        
        if (!showPreview) {
          clearFile();
        }
      }, 500);

    } catch (error) {
      setIsUploading(false);
      setUploadProgress(0);
      setError(error instanceof Error ? error.message : 'Помилка завантаження файлу');
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

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
    
    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const openFileDialog = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className={cn('space-y-3', className)}>
      {/* Зона завантаження */}
      <div
        className={cn(
          'border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors',
          isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400',
          disabled && 'opacity-50 cursor-not-allowed',
          selectedFile && showPreview && 'border-green-500 bg-green-50'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          onChange={handleInputChange}
          className="hidden"
          disabled={disabled}
          accept={allowedTypes?.join(',')}
        />
        
        <div className="flex flex-col items-center space-y-2">
          {selectedFile ? (
            <>
              <Paperclip className="w-8 h-8 text-green-600" />
              <p className="text-sm font-medium text-green-700">
                {selectedFile.name}
              </p>
              <p className="text-xs text-gray-500">
                {UploadService.formatFileSize(selectedFile.size)}
              </p>
            </>
          ) : (
            <>
              <Upload className="w-8 h-8 text-gray-400" />
              <p className="text-sm text-gray-600">
                Перетягніть файл сюди або <span className="text-blue-600">клікніть для вибору</span>
              </p>
              <p className="text-xs text-gray-500">
                Максимальний розмір: {maxSizeInMB}МБ
              </p>
            </>
          )}
        </div>
      </div>

      {/* Прогрес завантаження */}
      {isUploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Завантаження...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Помилка */}
      {error && (
        <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Превью файлу */}
      {selectedFile && showPreview && !isUploading && (
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <span className="text-lg">
              {UploadService.getFileIcon(selectedFile.name)}
            </span>
            <div>
              <p className="text-sm font-medium">{selectedFile.name}</p>
              <p className="text-xs text-gray-500">
                {UploadService.formatFileSize(selectedFile.size)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {!uploadOnSelect && (
              <Button
                size="sm"
                onClick={() => handleUpload()}
                disabled={disabled}
              >
                <Upload className="w-4 h-4 mr-2" />
                Завантажити
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={clearFile}
              disabled={disabled}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default FileUpload;