import {combineReducers, configureStore} from "@reduxjs/toolkit"
import authReducer from "./reducers/AuthSlice";
import {TypedUseSelectorHook, useDispatch, useSelector} from "react-redux";

const rootReducer = combineReducers({
    auth: authReducer
});

const setupStore = () => {
    return configureStore({
        reducer: rootReducer
    });
}

export const store = setupStore();

//типи
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

//hooks
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;