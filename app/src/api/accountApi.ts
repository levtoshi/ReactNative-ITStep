import axios from "axios";
import {API_BASE_URL} from "@/api/config";
import {IForgotPasswordType} from "@/types/auth/IForgotPasswordType";
import {IResetPasswordType} from "@/types/auth/IResetPasswordType";

const ACCOUNT_API_URL = `${API_BASE_URL}/api/Account`;

export interface IMessageResponse {
    message: string;
}

export const forgotPassword = (data: IForgotPasswordType) =>
    axios.post<IMessageResponse>(`${ACCOUNT_API_URL}/ForgotPassword`, data);

export const resetPassword = (data: IResetPasswordType) =>
    axios.post<IMessageResponse>(`${ACCOUNT_API_URL}/ResetPassword`, data);
