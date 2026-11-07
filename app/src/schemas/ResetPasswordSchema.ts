import { z } from "zod"

export const ResetPasswordSchema = z
    .object({
        email:
            z.email("Вкажіть правильно пошту"),
        code:
            z.string().regex(/^\d{6}$/, "Код має складатися з 6 цифр"),
        newPassword:
            z.string().min(6, "Пароль має бути мін 6 символів"),
    });
