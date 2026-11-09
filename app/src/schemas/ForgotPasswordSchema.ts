import { z } from "zod"

// Правила для форми «Забули пароль»: єдине поле — коректний email
export const ForgotPasswordSchema = z
    .object({
        email:
            z.email("Вкажіть правильно пошту"),
    });
