'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { clientSchema, ClientFormData } from '@/lib/utils/validation';
import { BLOOD_TYPES, GENDER_OPTIONS } from '@/lib/constants';
import { Client } from '@/types';
import { useClientMutations } from '@/hooks';
import { Camera, Upload, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ClientFormProps {
  client?: Client;
  onSuccess: (client: Client) => void;
  onCancel: () => void;
}

export function ClientForm({ client, onSuccess, onCancel }: ClientFormProps) {
  const [loading, setLoading] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(client?.photo_url || null);
  const { createClient, updateClient, uploadClientPhoto } = useClientMutations();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: client ? {
      full_name: client.full_name,
      phone: client.phone,
      email: client.email || '',
      birth_date: client.birth_date || '',
      blood_type: (client.blood_type as any) || 'not_specified',
      gender: ((client as any).gender as any) || 'not_specified',
      medical_conditions: client.medical_conditions || '',
      emergency_contact_name: client.emergency_contact_name || '',
      emergency_contact_phone: client.emergency_contact_phone || '',
    } : {
      blood_type: 'not_specified' as any,
      gender: 'not_specified' as any,
    },
  });

  const selectedBloodType = watch('blood_type');
  const selectedGender = watch('gender');

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file
      if (file.size > 2 * 1024 * 1024) {
        alert('File size must be less than 2MB');
        return;
      }
      
      if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
        alert('Only JPEG, PNG, and WebP images are allowed');
        return;
      }

      setPhotoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setPhotoPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(client?.photo_url || null);
  };

  const onSubmit = async (data: ClientFormData) => {
    try {
      setLoading(true);
      
      // Convert "not_specified" values to empty strings for database storage
      const processedData = {
        ...data,
        blood_type: data.blood_type === 'not_specified' ? '' : data.blood_type,
        gender: data.gender === 'not_specified' ? '' : data.gender,
      };
      
      let savedClient: Client;
      
      if (client) {
        // Update existing client
        savedClient = (await updateClient(client.id, processedData)) as Client;
      } else {
        // Create new client
        savedClient = (await createClient(processedData)) as Client;
      }

      // Upload photo if selected
      if (photoFile && savedClient) {
        await uploadClientPhoto(savedClient.id, photoFile);
      }

      onSuccess(savedClient);
    } catch (error) {
      console.error('Error saving client:', error);
      alert(error instanceof Error ? error.message : 'Failed to save client');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Photo Upload */}
      <Card className="bg-midnight-magic border-stormy-weather/30">
        <CardHeader>
          <CardTitle className="text-silver-setting">Photo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20 border-2 border-stormy-weather/30">
              <AvatarImage src={photoPreview || undefined} />
              <AvatarFallback className="bg-stormy-weather/20 text-silver-setting text-lg">
                {watch('full_name') ? getInitials(watch('full_name')) : '?'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex gap-2">
                <Label htmlFor="photo" className="cursor-pointer">
                  <Button type="button" variant="outline" size="sm" asChild>
                    <span className="border-stormy-weather text-stormy-weather hover:bg-stormy-weather/10">
                      <Camera className="h-4 w-4 mr-2" />
                      {photoPreview ? 'Change' : 'Upload'}
                    </span>
                  </Button>
                </Label>
                {photoPreview && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={removePhoto}
                    className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <Input
                id="photo"
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
              <p className="text-xs text-stormy-weather mt-1">
                JPG, PNG or WebP. Max 2MB.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Basic Information */}
      <Card className="bg-midnight-magic border-stormy-weather/30">
        <CardHeader>
          <CardTitle className="text-silver-setting">Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="full_name" className="text-silver-setting">
              Full Name <span className="text-red-400">*</span>
            </Label>
            <Input
              id="full_name"
              {...register('full_name')}
              className="bg-black-beauty border-stormy-weather text-silver-setting"
              placeholder="Enter full name"
            />
            {errors.full_name && (
              <p className="text-red-400 text-sm mt-1">{errors.full_name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="phone" className="text-silver-setting">
              Phone <span className="text-red-400">*</span>
            </Label>
            <Input
              id="phone"
              {...register('phone')}
              className="bg-black-beauty border-stormy-weather text-silver-setting"
              placeholder="1234567890"
              maxLength={10}
            />
            {errors.phone && (
              <p className="text-red-400 text-sm mt-1">{errors.phone.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="email" className="text-silver-setting">Email</Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              className="bg-black-beauty border-stormy-weather text-silver-setting"
              placeholder="email@example.com"
            />
            {errors.email && (
              <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="birth_date" className="text-silver-setting">Birth Date</Label>
              <Input
                id="birth_date"
                type="date"
                {...register('birth_date')}
                className="bg-black-beauty border-stormy-weather text-silver-setting"
              />
              {errors.birth_date && (
                <p className="text-red-400 text-sm mt-1">{errors.birth_date.message}</p>
              )}
            </div>

            <div>
              <Label className="text-silver-setting">Gender</Label>
              <Select value={selectedGender} onValueChange={(value) => setValue('gender', value as any)}>
                <SelectTrigger className="bg-black-beauty border-stormy-weather text-silver-setting">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent className="bg-midnight-magic border-stormy-weather">
                  <SelectItem value="not_specified" className="text-silver-setting">Not specified</SelectItem>
                  {GENDER_OPTIONS.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      className="text-silver-setting hover:bg-stormy-weather/20"
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-silver-setting">Blood Type</Label>
            <Select value={selectedBloodType} onValueChange={(value) => setValue('blood_type', value as any)}>
              <SelectTrigger className="bg-black-beauty border-stormy-weather text-silver-setting">
                <SelectValue placeholder="Select blood type" />
              </SelectTrigger>
              <SelectContent className="bg-midnight-magic border-stormy-weather">
                <SelectItem value="not_specified" className="text-silver-setting">Not specified</SelectItem>
                {BLOOD_TYPES.map((type) => (
                  <SelectItem
                    key={type}
                    value={type}
                    className="text-silver-setting hover:bg-stormy-weather/20"
                  >
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Medical Information */}
      <Card className="bg-midnight-magic border-stormy-weather/30">
        <CardHeader>
          <CardTitle className="text-silver-setting">Medical Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="medical_conditions" className="text-silver-setting">
              Medical Conditions
            </Label>
            <Textarea
              id="medical_conditions"
              {...register('medical_conditions')}
              className="bg-black-beauty border-stormy-weather text-silver-setting"
              placeholder="Any medical conditions, allergies, or health notes..."
              rows={3}
            />
            {errors.medical_conditions && (
              <p className="text-red-400 text-sm mt-1">{errors.medical_conditions.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Emergency Contact */}
      <Card className="bg-midnight-magic border-stormy-weather/30">
        <CardHeader>
          <CardTitle className="text-silver-setting">Emergency Contact</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="emergency_contact_name" className="text-silver-setting">
              Contact Name
            </Label>
            <Input
              id="emergency_contact_name"
              {...register('emergency_contact_name')}
              className="bg-black-beauty border-stormy-weather text-silver-setting"
              placeholder="Emergency contact full name"
            />
            {errors.emergency_contact_name && (
              <p className="text-red-400 text-sm mt-1">{errors.emergency_contact_name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="emergency_contact_phone" className="text-silver-setting">
              Contact Phone
            </Label>
            <Input
              id="emergency_contact_phone"
              {...register('emergency_contact_phone')}
              className="bg-black-beauty border-stormy-weather text-silver-setting"
              placeholder="1234567890"
              maxLength={10}
            />
            {errors.emergency_contact_phone && (
              <p className="text-red-400 text-sm mt-1">{errors.emergency_contact_phone.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1 border-stormy-weather text-stormy-weather hover:bg-stormy-weather/10"
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="flex-1 bg-coastal-vista hover:bg-coastal-vista/90 text-black-beauty"
          disabled={loading}
        >
          {loading ? 'Saving...' : client ? 'Update Client' : 'Create Client'}
        </Button>
      </div>
    </form>
  );
}