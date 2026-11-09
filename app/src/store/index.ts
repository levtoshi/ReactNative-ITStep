import {combineReducers, configureStore} from "@reduxjs/toolkit"
import authReducer from "./reducers/AuthSlice";
import {api} from "@/api/apiSlice";
import {TypedUseSelectorHook, useDispatch, useSelector} from "react-redux";

const rootReducer = combineReducers({
    auth: authReducer,
    [api.reducerPath]: api.reducer,
});

const setupStore = () => {
    return configureStore({
        reducer: rootReducer,
        middleware: (getDefault) => getDefault().concat(api.middleware),
    });
}

export const store = setupStore();

//типи
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

//hooks
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;