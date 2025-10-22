import { z } from 'zod';

// Profile validation schemas
export const profileSchema = z.object({
  display_name: z.string()
    .trim()
    .max(100, "Ім'я не може перевищувати 100 символів")
    .optional()
    .or(z.literal('')),
});

// Listing validation schemas
export const listingSchema = z.object({
  title: z.string()
    .trim()
    .min(1, "Назва обов'язкова")
    .max(200, "Назва не може перевищувати 200 символів"),
  description: z.string()
    .trim()
    .max(2000, "Опис не може перевищувати 2000 символів")
    .optional()
    .or(z.literal('')),
  price: z.number()
    .positive("Ціна повинна бути більше 0")
    .max(1000000, "Ціна занадто велика"),
  category: z.string()
    .min(1, "Категорія обов'язкова"),
  image: z.string()
    .url("Невірний формат URL")
    .optional()
    .or(z.literal('')),
});

// Auth validation schemas
export const authSchema = z.object({
  email: z.string()
    .trim()
    .email("Невірний формат email")
    .max(255, "Email занадто довгий"),
  password: z.string()
    .min(6, "Пароль має містити мінімум 6 символів")
    .max(72, "Пароль занадто довгий"), // bcrypt limit
  name: z.string()
    .trim()
    .max(100, "Ім'я занадто довге")
    .optional()
    .or(z.literal('')),
});
