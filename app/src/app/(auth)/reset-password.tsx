// Екран 2 з 2 у відновленні пароля: користувач вводить код із листа і новий пароль.
// Email приходить з екрана forgot-password через параметр маршруту, але його можна виправити вручну.
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
// useLocalSearchParams — читає параметри, передані при переході (тут — email)
import {router, useLocalSearchParams} from "expo-router";
import {Controller, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
// Правила валідації: коректна пошта, код із 6 цифр, пароль від 6 символів
import {ResetPasswordSchema} from "@/schemas/ResetPasswordSchema";
import {IResetPasswordType} from "@/types/auth/IResetPasswordType";
// resetPassword — POST /api/Account/ResetPassword; forgotPassword — повторне надсилання коду
import {useForgotPasswordMutation, useResetPasswordMutation} from "@/api/apiSlice";
import {getApiError} from "@/api/apiErrors";

const ResetPasswordScreen = () => {
    // Параметри маршруту: { email } з попереднього екрана
    const params = useLocalSearchParams<{ email?: string }>();
    // Текст помилки від сервера (напр. «Невірний або прострочений код.»)
    const [serverError, setServerError] = useState<string | null>(null);
    const [resetPassword] = useResetPasswordMutation();
    const [forgotPassword] = useForgotPasswordMutation();

    // getValues — дістає поточне значення поля без перевірки форми (потрібно для «Надіслати код ще раз»)
    const {
        control,
        handleSubmit,
        getValues,
        formState: {errors, isSubmitting},
    } = useForm<IResetPasswordType>({
        resolver: zodResolver(ResetPasswordSchema),
        // Email підставляємо з параметра, щоб користувач не вводив його вдруге
        defaultValues: {email: params.email ?? "", code: "", newPassword: ""},
    });

    // Викликається після натиску «Змінити пароль», лише якщо всі поля валідні
    const onSubmit = async (data: IResetPasswordType) => {
        setServerError(null);
        try {
            // Сервер перевіряє код і міняє пароль; при невірному коді повертає 400 з текстом помилки
            await resetPassword(data).unwrap();
            // Успіх: показуємо повідомлення, і після «OK» переходимо на вхід
            Alert.alert("Готово", "Пароль змінено. Увійдіть з новим паролем.", [
                {text: "OK", onPress: () => router.replace("/login")},
            ]);
        } catch (error) {
            // Показуємо текст помилки із сервера, а якщо його немає — загальний
            setServerError(getApiError(error).message ?? "Не вдалося змінити пароль. Спробуйте ще раз.");
        }
    };

    // Повторне надсилання коду: той самий запит, що й на попередньому екрані.
    // Використовуємо email з поля, бо користувач міг його виправити
    const onResendCode = async () => {
        setServerError(null);
        try {
            await forgotPassword({email: getValues("email")}).unwrap();
            Alert.alert("Готово", "Новий код надіслано на пошту.");
        } catch {
            setServerError("Не вдалося надіслати код повторно. Спробуйте пізніше.");
        }
    };

    return (
        <SafeAreaView className="flex-1">
            {/* Зсуває вміст угору, коли відкривається клавіатура */}
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
                    {/* Дотик поза полем ховає клавіатуру */}
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                        <View className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
                            <Text className="mb-2 text-center text-3xl font-bold text-slate-900">
                                Новий пароль
                            </Text>
                            <Text className="mb-8 text-center text-base text-slate-500">
                                Введіть 6-значний код із листа і придумайте новий пароль
                            </Text>

                            {/* ---------- Електронна пошта ---------- */}
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

                            {/* ---------- Код із листа ---------- */}
                            <View className="mb-5">
                                <Text className="mb-2 text-sm font-medium text-slate-700">
                                    Код із листа
                                </Text>

                                {/* number-pad — цифрова клавіатура; maxLength={6} — не більше 6 символів;
                                    tracking-widest — збільшені проміжки між цифрами */}
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

                            {/* ---------- Новий пароль ---------- */}
                            <View className="mb-5">
                                <Text className="mb-2 text-sm font-medium text-slate-700">
                                    Новий пароль
                                </Text>

                                {/* secureTextEntry — символи приховуються крапками */}
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

                            {/* Помилка від сервера (невірний або прострочений код тощо) */}
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

                            {/* Якщо лист не прийшов або код прострочився — просимо новий */}
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

// Файл app/(auth)/reset-password.tsx відкривається за адресою /reset-password
export default ResetPasswordScreen;
