'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { User, Lock, Mail, Phone } from 'lucide-react';
import { settingsService } from '@/services/settingsService';

export default function AccountSettings() {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Завантаження поточних даних профілю
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setIsLoadingProfile(true);
    try {
      const profile = await settingsService.getCurrentProfile();
      setFormData(prev => ({
        ...prev,
        firstName: profile.first_name || '',
        lastName: profile.last_name || '',
        email: profile.email || '',
        phoneNumber: profile.phone_number || '',
      }));
    } catch (error) {
      console.error('Помилка завантаження профілю:', error);
      // Показати повідомлення про помилку
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      await settingsService.updateProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
      });
      
      // Показати повідомлення про успіх
      alert('Профіль успішно оновлено!');
    } catch (error) {
      console.error('Помилка збереження профілю:', error);
      alert('Помилка збереження профілю. Спробуйте ще раз.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (formData.newPassword !== formData.confirmPassword) {
      alert('Нові паролі не співпадають');
      return;
    }

    if (formData.newPassword.length < 6) {
      alert('Новий пароль повинен містити мінімум 6 символів');
      return;
    }

    setIsLoading(true);
    try {
      const result = await settingsService.changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
      
      if (result.success) {
        // Очистити поля паролю
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        }));
        alert('Пароль успішно змінено!');
      } else {
        alert(result.message || 'Помилка зміни паролю');
      }
    } catch (error) {
      console.error('Помилка зміни паролю:', error);
      alert('Помилка зміни паролю. Перевірте правильність поточного паролю.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingProfile) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="flex items-center justify-center p-6">
            <p>Завантаження налаштувань...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Основна інформація профілю */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Основна інформація
          </CardTitle>
          <CardDescription>
            Оновіть свою особисту інформацію
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Ім'я</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                placeholder="Введіть ваше ім'я"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Прізвище</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                placeholder="Введіть ваше прізвище"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="введіть ваш email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Номер телефону
            </Label>
            <Input
              id="phoneNumber"
              value={formData.phoneNumber}
              onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
              placeholder="Введіть ваш номер телефону"
            />
          </div>

          <div className="pt-4">
            <Button onClick={handleSaveProfile} disabled={isLoading}>
              {isLoading ? 'Збереження...' : 'Зберегти зміни'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Зміна паролю */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Безпека
          </CardTitle>
          <CardDescription>
            Змініть свій пароль для безпеки акаунта
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Поточний пароль</Label>
            <Input
              id="currentPassword"
              type="password"
              value={formData.currentPassword}
              onChange={(e) => handleInputChange('currentPassword', e.target.value)}
              placeholder="Введіть поточний пароль"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">Новий пароль</Label>
            <Input
              id="newPassword"
              type="password"
              value={formData.newPassword}
              onChange={(e) => handleInputChange('newPassword', e.target.value)}
              placeholder="Введіть новий пароль (мінімум 6 символів)"
              minLength={6}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Підтвердити новий пароль</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              placeholder="Підтвердіть новий пароль"
            />
          </div>

          <div className="pt-4">
            <Button 
              onClick={handleChangePassword} 
              disabled={isLoading || !formData.currentPassword || !formData.newPassword || !formData.confirmPassword}
              variant="outline"
            >
              {isLoading ? 'Змінюється...' : 'Змінити пароль'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}