import {useState} from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Keyboard,
    TouchableWithoutFeedback,
    Pressable,
    Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {router, useLocalSearchParams} from "expo-router";
import {Controller, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import axios from "axios";
import {ResetPasswordSchema} from "@/schemas/ResetPasswordSchema";
import {IResetPasswordType} from "@/types/auth/IResetPasswordType";
import {forgotPassword, resetPassword} from "@/api/accountApi";

const getErrorMessage = (error: unknown, fallback: string): string =>
    axios.isAxiosError<{ error?: string }>(error) ? error.response?.data?.error ?? fallback : fallback;

const ResetPasswordScreen = () => {
    const params = useLocalSearchParams<{ email?: string }>();
    const [serverError, setServerError] = useState<string | null>(null);

    const {
        control,
        handleSubmit,
        getValues,
        formState: {errors, isSubmitting},
    } = useForm<IResetPasswordType>({
        resolver: zodResolver(ResetPasswordSchema),
        defaultValues: {email: params.email ?? "", code: "", newPassword: ""},
    });

    const onSubmit = async (data: IResetPasswordType) => {
        setServerError(null);
        try {
            await resetPassword(data);
            Alert.alert("Готово", "Пароль змінено. Увійдіть з новим паролем.", [
                {text: "OK", onPress: () => router.replace("/login")},
            ]);
        } catch (error) {
            setServerError(getErrorMessage(error, "Не вдалося змінити пароль. Спробуйте ще раз."));
        }
    };

    const onResendCode = async () => {
        setServerError(null);
        try {
            await forgotPassword({email: getValues("email")});
            Alert.alert("Готово", "Новий код надіслано на пошту.");
        } catch {
            setServerError("Не вдалося надіслати код повторно. Спробуйте пізніше.");
        }
    };

    return (
        <SafeAreaView className="flex-1">
            <KeyboardAvoidingView
                className="flex-1"
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
                <ScrollView
                    className="flex-1"
                    contentContainerClassName="flex-grow px-6 py-10"
                    keyboardShouldPersistTaps="handled"
                    keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
                    automaticallyAdjustKeyboardInsets
                    showsVerticalScrollIndicator={false}
                >
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                        <View className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
                            <Text className="mb-2 text-center text-3xl font-bold text-slate-900">
                                Новий пароль
                            </Text>
                            <Text className="mb-8 text-center text-base text-slate-500">
                                Введіть 6-значний код із листа і придумайте новий пароль
                            </Text>

                            <View className="mb-5">
                                <Text className="mb-2 text-sm font-medium text-slate-700">
                                    Електронна пошта
                                </Text>

                                <Controller
                                    control={control}
                                    name="email"
                                    render={({field: {onChange, onBlur, value}}) => (
                                        <TextInput
                                            className="mb-2 h-14 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 text-base text-slate-900 focus:border-indigo-500 focus:bg-white"
                                            value={value}
                                            onChangeText={onChange}
                                            onBlur={onBlur}
                                            placeholderTextColor="#94a3b8"
                                            keyboardType="email-address"
                                            autoCapitalize="none"
                                            autoComplete="email"
                                        />
                                    )}
                                />

                                {errors.email && (
                                    <Text className="mt-1 text-xs text-red-500">{errors.email.message}</Text>
                                )}
                            </View>

                            <View className="mb-5">
                                <Text className="mb-2 text-sm font-medium text-slate-700">
                                    Код із листа
                                </Text>

                                <Controller
                                    control={control}
                                    name="code"
                                    render={({field: {onChange, onBlur, value}}) => (
                                        <TextInput
                                            className="mb-2 h-14 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 text-center text-2xl font-semibold tracking-widest text-slate-900 focus:border-indigo-500 focus:bg-white"
                                            value={value}
                                            onChangeText={onChange}
                                            onBlur={onBlur}
                                            placeholder="••••••"
                                            placeholderTextColor="#94a3b8"
                                            keyboardType="number-pad"
                                            maxLength={6}
                                        />
                                    )}
                                />

                                {errors.code && (
                                    <Text className="mt-1 text-xs text-red-500">{errors.code.message}</Text>
                                )}
                            </View>

                            <View className="mb-5">
                                <Text className="mb-2 text-sm font-medium text-slate-700">
                                    Новий пароль
                                </Text>

                                <Controller
                                    control={control}
                                    name="newPassword"
                                    render={({field: {onChange, onBlur, value}}) => (
                                        <TextInput
                                            className="mb-2 h-14 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 text-base text-slate-900 focus:border-indigo-500 focus:bg-white"
                                            value={value}
                                            onChangeText={onChange}
                                            onBlur={onBlur}
                                            placeholder="••••••••"
                                            placeholderTextColor="#94a3b8"
                                            secureTextEntry
                                            autoCapitalize="none"
                                        />
                                    )}
                                />

                                {errors.newPassword && (
                                    <Text className="mt-1 text-xs text-red-500">{errors.newPassword.message}</Text>
                                )}
                            </View>

                            {serverError && (
                                <Text className="mb-4 text-sm text-red-500">{serverError}</Text>
                            )}

                            <Pressable
                                onPress={() => handleSubmit(onSubmit)()}
                                disabled={isSubmitting}
                                className={`mb-4 h-14 w-full items-center justify-center rounded-xl bg-indigo-600 active:bg-indigo-700 ${isSubmitting ? "opacity-60" : ""}`}
                            >
                                <Text className="text-base font-semibold text-white">
                                    {isSubmitting ? "Зберігаємо..." : "Змінити пароль"}
                                </Text>
                            </Pressable>

                            <TouchableOpacity
                                onPress={onResendCode}
                                disabled={isSubmitting}
                                className="mb-4 h-14 w-full items-center justify-center rounded-xl border border-slate-300 bg-slate-50 active:bg-slate-100"
                            >
                                <Text className="text-base font-semibold text-slate-700">
                                    Надіслати код ще раз
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => router.replace("/login")}
                                className="h-14 w-full items-center justify-center"
                            >
                                <Text className="text-base font-semibold text-indigo-600">
                                    Назад до входу
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableWithoutFeedback>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default ResetPasswordScreen;
