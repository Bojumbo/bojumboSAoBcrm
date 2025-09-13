'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Send, MessageSquare, User, Clock } from 'lucide-react';
import { ProjectComment } from '@/types/projects';
import { getAuthToken, redirectToLogin } from '@/lib/auth';

interface ProjectChatProps {
  projectId: number;
}

export default function ProjectChat({ projectId }: ProjectChatProps) {
  const [comments, setComments] = useState<ProjectComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'nearest',
      inline: 'nearest'
    });
  };

  useEffect(() => {
    // Скролимо тільки при додаванні нових коментарів, не при першому завантаженні
    if (comments.length > 0 && !loading) {
      const timeoutId = setTimeout(() => {
        scrollToBottom();
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [comments.length, loading]); // Залежність від довжини масиву, а не самого масиву

  useEffect(() => {
    fetchComments();
  }, [projectId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      
      if (!token) {
        redirectToLogin();
        return;
      }
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/comments/projects/${projectId}`,
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
        console.log('Comments API response:', result);
        
        // Перевіряємо формат відповіді
        let data;
        if (result.success && result.data) {
          data = result.data;
        } else {
          data = result;
        }
        
        // Перевіряємо чи data є масивом
        setComments(Array.isArray(data) ? data : []);
      } else {
        console.error('Failed to fetch comments:', response.status);
        setComments([]); // Встановлюємо порожній масив при помилці
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      setComments([]); // Встановлюємо порожній масив при помилці
    } finally {
      setLoading(false);
    }
  };

  const handleSendComment = async () => {
    if (!newComment.trim() || sending) return;

    try {
      setSending(true);
      const token = getAuthToken();
      
      if (!token) {
        redirectToLogin();
        return;
      }
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/comments/projects/${projectId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            content: newComment.trim(),
          }),
        }
      );

      if (response.status === 401 || response.status === 403) {
        redirectToLogin();
        return;
      }

      if (response.ok) {
        const result = await response.json();
        console.log('Send comment response:', result);
        setNewComment('');
        await fetchComments(); // Оновлюємо список коментарів
      } else {
        console.error('Failed to send comment:', response.status);
        const errorText = await response.text();
        console.error('Error details:', errorText);
      }
    } catch (error) {
      console.error('Error sending comment:', error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendComment();
    }
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
          <span className="truncate">Чат проекту</span>
          {Array.isArray(comments) && comments.length > 0 && (
            <Badge variant="secondary" className="text-xs">{comments.length}</Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        {/* Область повідомлень */}
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
                    <div className="bg-muted/50 rounded-lg p-2 md:p-3">
                      <p className="text-xs md:text-sm whitespace-pre-wrap break-words">{comment.content}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <Separator />

        {/* Поле введення */}
        <div className="p-3 md:p-4 flex-shrink-0">
          <div className="flex gap-2">
            <Textarea
              placeholder="Напишіть коментар... (Enter для відправки, Shift+Enter для нового рядка)"
              value={newComment}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewComment(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={sending}
              className="min-h-[60px] md:min-h-[80px] resize-none text-sm"
            />
            <Button
              onClick={handleSendComment}
              disabled={!newComment.trim() || sending}
              size="icon"
              className="self-end h-8 w-8 md:h-10 md:w-10"
            >
              <Send className="h-3 w-3 md:h-4 md:w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}