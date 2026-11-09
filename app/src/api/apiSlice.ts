import {createApi} from "@reduxjs/toolkit/query/react";
import {serialize} from "object-to-formdata";
import {baseQuery} from "@/api/baseQuery";
import {ILoginType} from "@/types/auth/ILoginType";
import {IRegisterType} from "@/types/auth/IRegisterType";
import {IAuthResponse} from "@/types/auth/IAuthResponse";

export const api = createApi({
    reducerPath: "api",
    baseQuery,
    endpoints: (builder) => ({
        login: builder.mutation<IAuthResponse, ILoginType>({
            query: (body) => ({url: "Account/Login", method: "POST", body}),
        }),
        register: builder.mutation<IAuthResponse, IRegisterType>({
            query: (data) => ({url: "Account/Register", method: "POST", body: serialize(data)}),
        }),
    }),
});

export const {useLoginMutation, useRegisterMutation} = api;
