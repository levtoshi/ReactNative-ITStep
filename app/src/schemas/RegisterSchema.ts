import { z } from "zod"

export const RegisterSchema = z
    .object({
        firstName:
            z.string().min(2, "Ім'я має бути мін 2 символи"),
        lastName:
            z.string().min(2, "Прізвище має бути мін 2 символи"),
        email:
            z.email("Вкажіть правильно пошту"),
        password:
            z.string().min(6, "Пароль має бути мін 6 символів")
    });