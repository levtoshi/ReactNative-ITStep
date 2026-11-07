import axios from "axios";
import {IForgotPasswordType} from "@/types/auth/IForgotPasswordType";
import {IResetPasswordType} from "@/types/auth/IResetPasswordType";

const ACCOUNT_API_URL = "https://salo.itstep.click/api/Account";

export interface IMessageResponse {
    message: string;
}

export const forgotPassword = (data: IForgotPasswordType) =>
    axios.post<IMessageResponse>(`${ACCOUNT_API_URL}/ForgotPassword`, data);

export const resetPassword = (data: IResetPasswordType) =>
    axios.post<IMessageResponse>(`${ACCOUNT_API_URL}/ResetPassword`, data);
