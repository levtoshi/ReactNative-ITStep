import {fetchBaseQuery} from "@reduxjs/toolkit/query/react";
import {API_BASE_URL} from "@/api/config";

// Базовий запит для RTK Query. Токен додаємо, якщо користувач увійшов.
// Тип стану описано структурно, щоб не імпортувати RootState зі store (уникаємо циклу).
export const baseQuery = fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/api/`,
    prepareHeaders: (headers, {getState}) => {
        const token = (getState() as { auth: { user?: { token?: string } } }).auth.user?.token;
        if (token) {
            headers.set("Authorization", `Bearer ${token}`);
        }
        return headers;
    },
});
