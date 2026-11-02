import {createSlice, type PayloadAction} from "@reduxjs/toolkit"
import {jwtDecode} from "jwt-decode"
import IUser from "@/types/IUser";

const getUserFromToken = (token: string) => {
    try {
        if (!token) return null;
        const decode = jwtDecode<IUser>(token);
        return decode ?? null;
    }
    catch (error) {
        console.error("Invalid token: " + error);
        return null;
    }
}

const token: string | undefined = undefined;
const user = token ? getUserFromToken(token) : undefined;

const initialState = {
    user
}

export const AuthSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        loginSuccess: (state, action: PayloadAction<string>) => {
            const user = getUserFromToken(action.payload);
            if(user)
            {
                state.user = {...user, token: action.payload};
            }
        },
        logout: (state) => {
            state.user = undefined;
        }
    }
});

export const {loginSuccess, logout} = AuthSlice.actions;
export default AuthSlice.reducer;
