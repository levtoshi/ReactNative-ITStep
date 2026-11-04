import { z } from "zod"

export const ProfileSchema = z
    .object({
        name:
            z.string().min(2, "Ім'я має бути мін 2 символи"),
        email:
            z.email("Вкажіть правильно пошту"),

        imageFile: z.object({
            uri: z.string(),
            name: z.string(),
            type: z.string(),
        }).optional(),
    });