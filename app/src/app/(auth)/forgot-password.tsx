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
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {router} from "expo-router";
import {Controller, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {ForgotPasswordSchema} from "@/schemas/ForgotPasswordSchema";
import {IForgotPasswordType} from "@/types/auth/IForgotPasswordType";
import {forgotPassword} from "@/api/accountApi";

const ForgotPasswordScreen = () => {
    const [serverError, setServerError] = useState<string | null>(null);

    const {
        control,
        handleSubmit,
        formState: {errors, isSubmitting},
    } = useForm<IForgotPasswordType>({
        resolver: zodResolver(ForgotPasswordSchema),
        defaultValues: {email: ""},
    });

    const onSubmit = async (data: IForgotPasswordType) => {
        setServerError(null);
        try {
            await forgotPassword(data);
            router.push({pathname: "/reset-password", params: {email: data.email}});
        } catch {
            setServerError("Не вдалося надіслати код. Перевірте з'єднання і спробуйте ще раз.");
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
                                Відновлення пароля
                            </Text>
                            <Text className="mb-8 text-center text-base text-slate-500">
                                Вкажіть email, і ми надішлемо на нього код підтвердження
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

                            {serverError && (
                                <Text className="mb-4 text-sm text-red-500">{serverError}</Text>
                            )}

                            <Pressable
                                onPress={() => handleSubmit(onSubmit)()}
                                disabled={isSubmitting}
                                className={`mb-4 h-14 w-full items-center justify-center rounded-xl bg-indigo-600 active:bg-indigo-700 ${isSubmitting ? "opacity-60" : ""}`}
                            >
                                <Text className="text-base font-semibold text-white">
                                    {isSubmitting ? "Надсилаємо..." : "Надіслати код"}
                                </Text>
                            </Pressable>

                            <TouchableOpacity
                                onPress={() => router.replace("/login")}
                                className="h-14 w-full items-center justify-center rounded-xl border border-slate-300 bg-slate-50 active:bg-slate-100"
                            >
                                <Text className="text-base font-semibold text-slate-700">
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

export default ForgotPasswordScreen;
