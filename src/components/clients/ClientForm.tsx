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
import { useClientMutations, usePlans } from '@/hooks';
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
  const { plans } = usePlans();

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
      current_plan_id: client.current_plan_id || '',
      birth_date: client.birth_date || '',
      blood_type: (client.blood_type as any) || 'not_specified',
      gender: ((client as any).gender as any) || 'not_specified',
      medical_conditions: client.medical_conditions || '',
      emergency_contact_name: client.emergency_contact_name || '',
      emergency_contact_phone: client.emergency_contact_phone || '',
    } : {
      blood_type: 'not_specified' as any,
      gender: 'not_specified' as any,
      current_plan_id: '',
    },
  });

  const selectedBloodType = watch('blood_type');
  const selectedGender = watch('gender');
  const selectedPlan = watch('current_plan_id');

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file
      if (file.size > 2 * 1024 * 1024) {
        alert('El archivo debe ser menor a 2MB');
        return;
      }
      
      if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
        alert('Solo se permiten imágenes JPEG, PNG y WebP');
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
      alert(error instanceof Error ? error.message : 'Error al guardar el cliente');
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
      <Card className="bg-carbon-gray border-slate-gray/30">
        <CardHeader>
          <CardTitle className="text-bright-white">Foto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20 border-2 border-slate-gray/30">
              <AvatarImage src={photoPreview || undefined} />
              <AvatarFallback className="bg-stormy-weather/20 text-bright-white text-lg">
                {watch('full_name') ? getInitials(watch('full_name')) : '?'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex gap-2">
                <Label htmlFor="photo" className="cursor-pointer">
                  <Button type="button" variant="outline" size="sm" asChild>
                    <span className="border-slate-gray text-light-gray hover:bg-slate-gray/10">
                      <Camera className="h-4 w-4 mr-2" />
                      {photoPreview ? 'Cambiar' : 'Subir'}
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
              <p className="text-xs text-light-gray mt-1">
                JPG, PNG o WebP. Máximo 2MB.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Basic Information */}
      <Card className="bg-carbon-gray border-slate-gray/30">
        <CardHeader>
          <CardTitle className="text-bright-white">Información Básica</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="full_name" className="text-bright-white">
              Nombre Completo <span className="text-red-400">*</span>
            </Label>
            <Input
              id="full_name"
              {...register('full_name')}
              className="bg-steel-gray border-slate-gray text-bright-white"
              placeholder="Ingresa el nombre completo"
            />
            {errors.full_name && (
              <p className="text-red-400 text-sm mt-1">{errors.full_name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="phone" className="text-bright-white">
              Teléfono <span className="text-red-400">*</span>
            </Label>
            <Input
              id="phone"
              {...register('phone')}
              className="bg-steel-gray border-slate-gray text-bright-white"
              placeholder="1234567890"
              maxLength={10}
            />
            {errors.phone && (
              <p className="text-red-400 text-sm mt-1">{errors.phone.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="email" className="text-bright-white">Correo Electrónico</Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              className="bg-steel-gray border-slate-gray text-bright-white"
              placeholder="correo@ejemplo.com"
            />
            {errors.email && (
              <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="birth_date" className="text-bright-white">Fecha de Nacimiento</Label>
              <Input
                id="birth_date"
                type="date"
                {...register('birth_date')}
                className="bg-steel-gray border-slate-gray text-bright-white"
              />
              {errors.birth_date && (
                <p className="text-red-400 text-sm mt-1">{errors.birth_date.message}</p>
              )}
            </div>

            <div>
              <Label className="text-bright-white">Género</Label>
              <Select value={selectedGender} onValueChange={(value) => setValue('gender', value as any)}>
                <SelectTrigger className="bg-steel-gray border-slate-gray text-bright-white">
                  <SelectValue placeholder="Selecciona el género" />
                </SelectTrigger>
                <SelectContent className="bg-midnight-magic border-slate-gray">
                  <SelectItem value="not_specified" className="text-bright-white">No especificado</SelectItem>
                  {GENDER_OPTIONS.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      className="text-bright-white hover:bg-stormy-weather/20"
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-bright-white">Tipo de Sangre</Label>
            <Select value={selectedBloodType} onValueChange={(value) => setValue('blood_type', value as any)}>
              <SelectTrigger className="bg-steel-gray border-slate-gray text-bright-white">
                <SelectValue placeholder="Selecciona tipo de sangre" />
              </SelectTrigger>
              <SelectContent className="bg-midnight-magic border-slate-gray">
                <SelectItem value="not_specified" className="text-bright-white">No especificado</SelectItem>
                {BLOOD_TYPES.map((type) => (
                  <SelectItem
                    key={type}
                    value={type}
                    className="text-bright-white hover:bg-stormy-weather/20"
                  >
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Plan Selection */}
      <Card className="bg-carbon-gray border-slate-gray/30">
        <CardHeader>
          <CardTitle className="text-bright-white">Plan de Membresía</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label className="text-bright-white">
              Plan Actual <span className="text-red-400">*</span>
            </Label>
            <Select value={watch('current_plan_id')} onValueChange={(value) => setValue('current_plan_id', value)}>
              <SelectTrigger className="bg-steel-gray border-slate-gray text-bright-white">
                <SelectValue placeholder="Selecciona un plan" />
              </SelectTrigger>
              <SelectContent className="bg-midnight-magic border-slate-gray">
                {plans.filter(plan => plan.is_active).map((plan) => (
                  <SelectItem
                    key={plan.id}
                    value={plan.id}
                    className="text-bright-white hover:bg-stormy-weather/20"
                  >
                    <div className="flex justify-between items-center w-full">
                      <span>{plan.name}</span>
                      <span className="text-coastal-vista ml-2">${plan.price}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.current_plan_id && (
              <p className="text-red-400 text-sm mt-1">{errors.current_plan_id.message}</p>
            )}
            <p className="text-xs text-light-gray mt-1">
              El cliente debe tener un plan asignado para poder registrarse
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Medical Information */}
      <Card className="bg-carbon-gray border-slate-gray/30">
        <CardHeader>
          <CardTitle className="text-bright-white">Información Médica</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="medical_conditions" className="text-bright-white">
              Condiciones Médicas
            </Label>
            <Textarea
              id="medical_conditions"
              {...register('medical_conditions')}
              className="bg-steel-gray border-slate-gray text-bright-white"
              placeholder="Cualquier condición médica, alergias o notas de salud..."
              rows={3}
            />
            {errors.medical_conditions && (
              <p className="text-red-400 text-sm mt-1">{errors.medical_conditions.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Emergency Contact */}
      <Card className="bg-carbon-gray border-slate-gray/30">
        <CardHeader>
          <CardTitle className="text-bright-white">Contacto de Emergencia</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="emergency_contact_name" className="text-bright-white">
              Nombre del Contacto
            </Label>
            <Input
              id="emergency_contact_name"
              {...register('emergency_contact_name')}
              className="bg-steel-gray border-slate-gray text-bright-white"
              placeholder="Nombre completo del contacto de emergencia"
            />
            {errors.emergency_contact_name && (
              <p className="text-red-400 text-sm mt-1">{errors.emergency_contact_name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="emergency_contact_phone" className="text-bright-white">
              Teléfono del Contacto
            </Label>
            <Input
              id="emergency_contact_phone"
              {...register('emergency_contact_phone')}
              className="bg-steel-gray border-slate-gray text-bright-white"
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
          className="flex-1 border-slate-gray text-light-gray hover:bg-slate-gray/10"
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          className="flex-1 bg-neon-cyan hover:bg-neon-cyan/90 text-deep-black"
          disabled={loading}
        >
          {loading ? 'Guardando...' : client ? 'Actualizar Cliente' : 'Crear Cliente'}
        </Button>
      </div>
    </form>
  );
}