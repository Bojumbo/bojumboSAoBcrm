"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Send, MessageSquare, User, Clock, Paperclip, X, Download, Trash2 } from "lucide-react";
import { ProjectComment } from "@/types/projects";
import { getAuthToken, redirectToLogin } from "@/lib/auth";
import { useAuth } from "@/contexts/AuthContext";

interface SubProjectChatProps {
  subprojectId: number;
}

export default function SubProjectChat({ subprojectId }: SubProjectChatProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<ProjectComment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [deletingCommentId, setDeletingCommentId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "nearest",
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
      // TODO: замінити на правильний API для підпроекту
      const response = await fetch(`/api/subprojects/${subprojectId}/comments`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const result = await response.json();
        setComments(Array.isArray(result) ? result : []);
      } else {
        setComments([]);
      }
    } catch (error) {
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  // ...далі логіка надсилання, видалення, рендеру коментарів (аналогічно ProjectChat)

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare size={20} /> Чат підпроекту
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Відображення коментарів */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Завантаження...</div>
            ) : comments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">Немає коментарів</div>
            ) : (
              comments.map((comment) => (
                <div key={comment.comment_id} className="mb-4">
                  <div className="flex items-center gap-2">
                    <User size={16} />
                    <span className="font-medium">
                      {comment.manager?.first_name} {comment.manager?.last_name}
                    </span>
                    <Badge variant="outline" className="ml-2">
                      <Clock size={14} className="mr-1" />
                      {comment.created_at}
                    </Badge>
                  </div>
                  <div className="mt-2 text-sm break-words">{comment.content}</div>
                  {/* TODO: додати кнопки для видалення, завантаження файлів */}
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
          <Separator className="my-4" />
          {/* Форма додавання коментаря */}
          <div className="flex flex-col gap-2">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Введіть повідомлення..."
              rows={3}
              disabled={sending}
            />
            <div className="flex items-center gap-2">
              <Button size="sm" disabled={sending || !newComment.trim()}>
                <Send size={16} className="mr-1" /> Надіслати
              </Button>
              {/* TODO: додати вибір файлів */}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
