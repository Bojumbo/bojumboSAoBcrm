import React, { useState, useRef } from 'react';
import { FileUploadService } from '../services/apiService';
import { API_CONFIG } from '../config/api';

interface FileUploadProps {
  onUploadSuccess: (fileInfo: { fileName: string; fileUrl: string; fileType: string }) => void;
  onUploadError?: (error: string) => void;
  accept?: string;
  maxSize?: number;
  multiple?: boolean;
  className?: string;
  disabled?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onUploadSuccess,
  onUploadError,
  accept,
  maxSize = API_CONFIG.UPLOAD.MAX_FILE_SIZE,
  multiple = false,
  className = '',
  disabled = false
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxSize) {
      return `Файл занадто великий. Максимальний розмір: ${(maxSize / 1024 / 1024).toFixed(1)}MB`;
    }

    // Check file type
    if (!API_CONFIG.UPLOAD.ALLOWED_TYPES.includes(file.type)) {
      return `Непідтримуваний тип файлу: ${file.type}`;
    }

    return null;
  };

  const handleFileUpload = async (files: FileList) => {
    setError(null);
    setIsUploading(true);

    try {
      const fileArray = Array.from(files);
      
      for (const file of fileArray) {
        const validationError = validateFile(file);
        if (validationError) {
          throw new Error(validationError);
        }

        const fileInfo = await FileUploadService.uploadFile(file);
        onUploadSuccess(fileInfo);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Помилка завантаження файлу';
      setError(errorMessage);
      onUploadError?.(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileUpload(files);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={className}>
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center
          ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-gray-400'}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={!disabled ? openFileDialog : undefined}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept={accept || API_CONFIG.UPLOAD.ALLOWED_TYPES.join(',')}
          multiple={multiple}
          onChange={handleFileInputChange}
          disabled={disabled || isUploading}
        />

        <div className="space-y-2">
          {isUploading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <span className="text-sm text-gray-600">Завантаження...</span>
            </div>
          ) : (
            <>
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="text-sm text-gray-600">
                <label className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500">
                  <span>Завантажити файл</span>
                </label>
                <p className="pl-1">або перетягнути сюди</p>
              </div>
              <p className="text-xs text-gray-500">
                {API_CONFIG.UPLOAD.ALLOWED_TYPES.map(type => type.split('/')[1]).join(', ')} до {(maxSize / 1024 / 1024).toFixed(1)}MB
              </p>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-2 text-sm text-red-600">
          {error}
        </div>
      )}
    </div>
  );
};

// Simple file upload button variant
export const FileUploadButton: React.FC<{
  onUploadSuccess: (fileInfo: { fileName: string; fileUrl: string; fileType: string }) => void;
  onUploadError?: (error: string) => void;
  accept?: string;
  maxSize?: number;
  multiple?: boolean;
  children?: React.ReactNode;
  className?: string;
  disabled?: boolean;
}> = ({
  onUploadSuccess,
  onUploadError,
  accept,
  maxSize,
  multiple,
  children = 'Завантажити файл',
  className = '',
  disabled = false
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (files: FileList) => {
    setError(null);
    setIsUploading(true);

    try {
      const fileArray = Array.from(files);
      
      for (const file of fileArray) {
        const fileInfo = await FileUploadService.uploadFile(file);
        onUploadSuccess(fileInfo);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Помилка завантаження файлу';
      setError(errorMessage);
      onUploadError?.(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept={accept}
        multiple={multiple}
        onChange={handleFileInputChange}
        disabled={disabled || isUploading}
      />
      
      <button
        type="button"
        onClick={openFileDialog}
        disabled={disabled || isUploading}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isUploading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Завантаження...
          </>
        ) : (
          children
        )}
      </button>

      {error && (
        <div className="mt-2 text-sm text-red-600">
          {error}
        </div>
      )}
    </div>
  );
};
