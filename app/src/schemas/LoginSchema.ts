import { z } from "zod"

export const LoginSchema = z
    .object({
        email:
            z.email("Вкажіть правильно пошту"),
        password:
            z.string().min(6,"Пароль має бути мін 6 символів")
    });