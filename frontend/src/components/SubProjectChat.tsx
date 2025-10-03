'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Send, MessageSquare, User, Clock, Paperclip, X, Download, Trash2 } from 'lucide-react';
import { ProjectComment } from '@/types/projects'; // Цей тип підходить і для коментарів підпроекту
import { getAuthToken, redirectToLogin } from '@/lib/auth';
import { useAuth } from '@/contexts/AuthContext';

interface SubProjectChatProps {
  subprojectId: number;
}

export default function SubProjectChat({ subprojectId }: SubProjectChatProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<ProjectComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [deletingCommentId, setDeletingCommentId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'nearest',
      inline: 'nearest'
    });
  };

  useEffect(() => {
    if (comments.length > 0 && !loading) {
      const timeoutId = setTimeout(() => {
        scrollToBottom();
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [comments.length, loading]);

  useEffect(() => {
    fetchComments();
  }, [subprojectId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      
      if (!token) {
        redirectToLogin();
        return;
      }
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/comments/subprojects/${subprojectId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401 || response.status === 403) {
        redirectToLogin();
        return;
      }

      if (response.ok) {
        const result = await response.json();
        let data = result.success && result.data ? result.data : result;
        const commentsArray = Array.isArray(data) ? data : [];
        setComments(commentsArray);
      } else {
        setComments([]);
      }
    } catch (error) {
      console.error('Error fetching subproject comments:', error);
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendComment = async () => {
    if (!newComment.trim() && selectedFiles.length === 0) return;

    try {
      setSending(true);
      const token = getAuthToken();
      
      if (!token) {
        redirectToLogin();
        return;
      }

      const formData = new FormData();
      
      if (newComment.trim()) {
        formData.append('content', newComment.trim());
      }
      
      selectedFiles.forEach((file) => {
        formData.append('files', file);
      });
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/comments/subprojects/${subprojectId}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (response.status === 401 || response.status === 403) {
        redirectToLogin();
        return;
      }

      if (response.ok) {
        setNewComment('');
        setSelectedFiles([]);
        await fetchComments();
      } else {
        console.error('Failed to send subproject comment:', response.status);
      }
    } catch (error) {
      console.error('Error sending subproject comment:', error);
    } finally {
      setSending(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!user || !window.confirm('Ви впевнені, що хочете видалити це повідомлення?')) {
      return;
    }

    try {
      setDeletingCommentId(commentId);
      const token = getAuthToken();
      
      if (!token) {
        redirectToLogin();
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/comments/subprojects/${subprojectId}/${commentId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401 || response.status === 403) {
        redirectToLogin();
        return;
      }

      if (response.ok) {
        setComments(prevComments => 
          prevComments.map(comment => 
            comment.comment_id === commentId 
              ? { ...comment, is_deleted: true, content: '', file_name: undefined, file_url: undefined }
              : comment
          )
        );
      } else {
        console.error('Failed to delete subproject comment:', response.status);
        alert('Помилка при видаленні повідомлення.');
      }
    } catch (error) {
      console.error('Error deleting subproject comment:', error);
      alert('Помилка при видаленні повідомлення.');
    } finally {
      setDeletingCommentId(null);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendComment();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Щойно';
    if (diffInMinutes < 60) return `${diffInMinutes} хв тому`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} год тому`;
    
    return date.toLocaleDateString('uk-UA', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="text-muted-foreground">Завантаження коментарів...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-[500px] md:h-[600px] flex flex-col w-full">
      <CardHeader className="pb-3 px-4 md:px-6 flex-shrink-0">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageSquare className="h-4 w-4 md:h-5 md:w-5" />
          <span className="truncate">Чат підпроекту</span>
          {Array.isArray(comments) && comments.length > 0 && (
            <Badge variant="secondary" className="text-xs">{comments.length}</Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4">
          {!Array.isArray(comments) || comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <MessageSquare className="h-10 w-10 md:h-12 md:w-12 text-muted-foreground mb-3 md:mb-4" />
              <p className="text-muted-foreground text-sm md:text-base">Поки що немає коментарів</p>
              <p className="text-xs md:text-sm text-muted-foreground">Будьте першим, хто залишить коментар!</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.comment_id} className="space-y-2">
                <div className="flex items-start gap-2 md:gap-3">
                  <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <User className="h-3 w-3 md:h-4 md:w-4 text-primary" />
                  </div>
                  <div className="flex-1 space-y-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-xs md:text-sm truncate">
                          {comment.manager ? 
                            `${comment.manager.first_name} ${comment.manager.last_name}` : 
                            'Невідомий користувач'
                          }
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1 flex-shrink-0">
                          <Clock className="h-2 w-2 md:h-3 md:w-3" />
                          {formatDate(comment.created_at)}
                        </span>
                      </div>
                      {user && comment.manager && comment.manager.manager_id === user.manager_id && !comment.is_deleted && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 opacity-50 hover:opacity-100 text-destructive hover:text-destructive"
                          onClick={() => handleDeleteComment(comment.comment_id)}
                          disabled={deletingCommentId === comment.comment_id}
                          title="Видалити повідомлення"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    <div className="bg-muted/50 rounded-lg p-2 md:p-3 space-y-2">
                      {comment.is_deleted ? (
                        <p className="text-xs md:text-sm text-muted-foreground italic">
                          Це повідомлення було видалено
                        </p>
                      ) : (
                        <>
                          {comment.content && (
                            <p className="text-xs md:text-sm whitespace-pre-wrap break-words">{comment.content}</p>
                          )}
                          {comment.file_name && comment.file_url && (
                            <div className="flex items-center gap-2 text-xs md:text-sm bg-background/50 rounded p-2 border">
                              <Paperclip className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
                              <span className="flex-1 truncate">{comment.file_name}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={async () => {
                                  try {
                                    if (!comment.file_url) return;
                                    let baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').replace('/api', '');
                                    let fileUrl = comment.file_url.includes('/api/uploads/') ? comment.file_url.replace('/api/uploads/', '/uploads/') : comment.file_url;
                                    if (!fileUrl.startsWith('/uploads/')) fileUrl = `/uploads/${fileUrl.replace(/^\/+/, '')}`;
                                    
                                    const pathParts = fileUrl.split('/');
                                    const encodedFileName = encodeURIComponent(pathParts.pop() || '');
                                    const encodedFileUrl = `${pathParts.join('/')}/${encodedFileName}`;
                                    
                                    const fullUrl = `${baseUrl}${encodedFileUrl}`;
                                    
                                    const response = await fetch(fullUrl);
                                    if (response.ok) {
                                      const blob = await response.blob();
                                      const url = window.URL.createObjectURL(blob);
                                      const link = document.createElement('a');
                                      link.href = url;
                                      link.download = comment.file_name || 'download';
                                      document.body.appendChild(link);
                                      link.click();
                                      document.body.removeChild(link);
                                      window.URL.revokeObjectURL(url);
                                    } else {
                                      window.open(fullUrl, '_blank');
                                    }
                                  } catch (error) {
                                    console.error('Error downloading file:', error);
                                  }
                                }}
                              >
                                <Download className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <Separator />

        <div className="p-3 md:p-4 flex-shrink-0">
          {selectedFiles.length > 0 && (
            <div className="mb-3">
              <p className="text-sm text-muted-foreground mb-2">Вибрані файли:</p>
              <div className="space-y-2">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm bg-muted p-2 rounded">
                    <Paperclip className="h-4 w-4" />
                    <span className="flex-1 truncate">{file.name}</span>
                    <span className="text-muted-foreground text-xs">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex gap-2">
            <div className="flex-1">
              <Textarea
                placeholder="Напишіть коментар... (Enter для відправки, Shift+Enter для нового рядка)"
                value={newComment}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewComment(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={sending}
                className="min-h-[60px] md:min-h-[80px] resize-none text-sm"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Button
                onClick={handleSendComment}
                disabled={(!newComment.trim() && selectedFiles.length === 0) || sending}
                size="icon"
                className="h-8 w-8 md:h-10 md:w-10"
              >
                <Send className="h-3 w-3 md:h-4 md:w-4" />
              </Button>
              <Button
                onClick={openFileDialog}
                disabled={sending}
                variant="outline"
                size="icon"
                className="h-8 w-8 md:h-10 md:w-10"
              >
                <Paperclip className="h-3 w-3 md:h-4 md:w-4" />
              </Button>
            </div>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileSelect}
            accept="*/*"
          />
        </div>
      </CardContent>
    </Card>
  );
}