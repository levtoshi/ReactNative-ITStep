import { z } from "zod"

export const ForgotPasswordSchema = z
    .object({
        email:
            z.email("Вкажіть правильно пошту"),
    });
