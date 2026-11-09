export interface IApiError {
    status?: number;
    message?: string;
}

// Витягує статус і текст поля `error` з помилки RTK Query (FetchBaseQueryError або SerializedError).
export const getApiError = (error: unknown): IApiError => {
    if (typeof error !== "object" || error === null) {
        return {};
    }

    const status = "status" in error && typeof error.status === "number" ? error.status : undefined;

    const data = "data" in error ? error.data : undefined;
    const message =
        typeof data === "object" && data !== null && "error" in data && typeof data.error === "string"
            ? data.error
            : undefined;

    return {status, message};
};
