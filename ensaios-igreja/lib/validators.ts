import { z } from 'zod';

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
});

export const userCreateSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
  role: z.enum(['ADMIN', 'USUARIO', 'ADOLESCENTE']),
});

export const userUpdateSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  role: z.enum(['ADMIN', 'USUARIO', 'ADOLESCENTE']),
});

// Hymn schemas
export const hymnCreateSchema = z.object({
  title: z.string().min(2, 'Título deve ter pelo menos 2 caracteres'),
  lyrics: z.string().min(1, 'Letra é obrigatória'),
  mp3Url: z.string().url('URL inválida').optional(),
});

export const hymnUpdateSchema = z.object({
  title: z.string().min(2, 'Título deve ter pelo menos 2 caracteres'),
  lyrics: z.string().min(1, 'Letra é obrigatória'),
  mp3Url: z.string().url('URL inválida').optional(),
});

// Rehearsal schemas
export const rehearsalSlotSchema = z.object({
  weekday: z.enum([
    'SUNDAY',
    'MONDAY',
    'TUESDAY',
    'WEDNESDAY',
    'THURSDAY',
    'FRIDAY',
    'SATURDAY',
  ]),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:mm)'),
  notes: z.string().optional(),
  active: z.boolean().default(true),
});

// File upload schema
export const fileUploadSchema = z.object({
  file: z
    .any()
    .refine((file) => file?.size <= 20 * 1024 * 1024, 'Arquivo deve ter no máximo 20MB')
    .refine(
      (file) => file?.type === 'audio/mpeg' || file?.type === 'audio/mp3',
      'Arquivo deve ser do tipo MP3'
    ),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type UserCreateInput = z.infer<typeof userCreateSchema>;
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
export type HymnCreateInput = z.infer<typeof hymnCreateSchema>;
export type HymnUpdateInput = z.infer<typeof hymnUpdateSchema>;
export type RehearsalSlotInput = z.infer<typeof rehearsalSlotSchema>;
export type FileUploadInput = z.infer<typeof fileUploadSchema>;