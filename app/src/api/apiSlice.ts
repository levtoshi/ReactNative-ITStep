import {createApi} from "@reduxjs/toolkit/query/react";
// serialize перетворює звичайний об'єкт (разом з файлом фото) у FormData для multipart-запиту
import {serialize} from "object-to-formdata";
import {baseQuery} from "@/api/baseQuery";
import {ILoginType} from "@/types/auth/ILoginType";
import {IRegisterType} from "@/types/auth/IRegisterType";
import {IForgotPasswordType} from "@/types/auth/IForgotPasswordType";
import {IResetPasswordType} from "@/types/auth/IResetPasswordType";
import {IAuthResponse} from "@/types/auth/IAuthResponse";

// Відповідь сервера на відновлення пароля: { message: "..." }
export interface IMessageResponse {
    message: string;
}

// Усі запити до сервера описані в одному місці.
// RTK Query сам створює з кожного endpoint хук (useLoginMutation тощо), який використовують екрани.
// Адреса складається з baseUrl (з baseQuery) + url з endpoint, напр. https://salo.itstep.click/api/Account/Login
export const api = createApi({
    reducerPath: "api",
    baseQuery,
    endpoints: (builder) => ({
        // Вхід: надсилає JSON { email, password }, у відповідь приходить { token }
        login: builder.mutation<IAuthResponse, ILoginType>({
            query: (body) => ({url: "Account/Login", method: "POST", body}),
        }),
        // Реєстрація: сервер чекає multipart/form-data (бо є файл фото), тому тіло загортаємо в serialize
        register: builder.mutation<IAuthResponse, IRegisterType>({
            query: (data) => ({url: "Account/Register", method: "POST", body: serialize(data)}),
        }),
        // Відновлення пароля, крок 1: надсилає { email }, сервер шле на пошту 6-значний код.
        // Відповідь завжди 200 { message }, навіть якщо такого email немає
        forgotPassword: builder.mutation<IMessageResponse, IForgotPasswordType>({
            query: (body) => ({url: "Account/ForgotPassword", method: "POST", body}),
        }),
        // Відновлення пароля, крок 2: надсилає { email, code, newPassword }.
        // Якщо код вірний — пароль змінено (200), якщо ні — 400 { error }
        resetPassword: builder.mutation<IMessageResponse, IResetPasswordType>({
            query: (body) => ({url: "Account/ResetPassword", method: "POST", body}),
        }),
    }),
});

// Експортуємо готові хуки для екранів
export const {
    useLoginMutation,
    useRegisterMutation,
    useForgotPasswordMutation,
    useResetPasswordMutation,
} = api;
