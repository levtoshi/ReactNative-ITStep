import { useRef } from 'react';
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
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { IRegisterType } from "@/types/auth/IRegisterType";
import { RegisterSchema } from "@/schemas/RegisterSchema";
import * as ImagePicker from "expo-image-picker";
import {ImagePickerButton} from "@/components/form/ImagePickerButton"

const inputClass =
    "mb-2 h-14 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 text-base text-slate-900 focus:border-indigo-500 focus:bg-white";

const RegisterScreen = () => {
    const lastNameRef = useRef<TextInput>(null);
    const emailRef = useRef<TextInput>(null);
    const passwordRef = useRef<TextInput>(null);

    const defaultValue: IRegisterType = {
        firstName: "",
        lastName: "",
        email: "",
        password: "",
    };

    const {
        control,
        handleSubmit,
        watch, //Ми зможемо слідкувати за певним полем в класі
        formState: { errors, isSubmitting },
    } = useForm<IRegisterType>({
        resolver: zodResolver(RegisterSchema),
        defaultValues: defaultValue,
    });

    const image = watch("imageFile");

    const url = "https://salo.itstep.click/api/Account/Register";

    const myOnSubmit = async (data: IRegisterType) => {
        try {
            const result = await axios.post(url, data);
            console.log("Успіх status", result.status);
            console.log("Успіх data", result.data);
            router.replace("/login");
        } catch (error) {
            console.log("Помилка", error);
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
                                Реєстрація
                            </Text>
                            <Text className="mb-8 text-center text-base text-slate-500">
                                Створити новий акаунт
                            </Text>

                            {/* Ім'я */}
                            <View className="mb-5">
                                <Text className="mb-2 text-sm font-medium text-slate-700">
                                    Ім'я
                                </Text>
                                <Controller
                                    control={control}
                                    name="firstName"
                                    render={({ field: { onChange, onBlur, value } }) => (
                                        <TextInput
                                            className={inputClass}
                                            value={value}
                                            onChangeText={onChange}
                                            onBlur={onBlur}
                                            placeholder="Іван"
                                            placeholderTextColor="#94a3b8"
                                            autoCapitalize="words"
                                            autoComplete="given-name"
                                            textContentType="givenName"
                                            returnKeyType="next"
                                            onSubmitEditing={() => lastNameRef.current?.focus()}
                                        />
                                    )}
                                />
                                {errors.firstName && (
                                    <Text className="mt-1 text-xs text-red-500">{errors.firstName.message}</Text>
                                )}
                            </View>

                            {/* Прізвище */}
                            <View className="mb-5">
                                <Text className="mb-2 text-sm font-medium text-slate-700">
                                    Прізвище
                                </Text>
                                <Controller
                                    control={control}
                                    name="lastName"
                                    render={({ field: { onChange, onBlur, value } }) => (
                                        <TextInput
                                            ref={lastNameRef}
                                            className={inputClass}
                                            value={value}
                                            onChangeText={onChange}
                                            onBlur={onBlur}
                                            placeholder="Петренко"
                                            placeholderTextColor="#94a3b8"
                                            autoCapitalize="words"
                                            autoComplete="family-name"
                                            textContentType="familyName"
                                            returnKeyType="next"
                                            onSubmitEditing={() => emailRef.current?.focus()}
                                        />
                                    )}
                                />
                                {errors.lastName && (
                                    <Text className="mt-1 text-xs text-red-500">{errors.lastName.message}</Text>
                                )}
                            </View>

                            {/* Email */}
                            <View className="mb-5">
                                <Text className="mb-2 text-sm font-medium text-slate-700">
                                    Електронна пошта
                                </Text>
                                <Controller
                                    control={control}
                                    name="email"
                                    render={({ field: { onChange, onBlur, value } }) => (
                                        <TextInput
                                            ref={emailRef}
                                            className={inputClass}
                                            value={value}
                                            onChangeText={onChange}
                                            onBlur={onBlur}
                                            placeholder="example@mail.com"
                                            placeholderTextColor="#94a3b8"
                                            keyboardType="email-address"
                                            autoCapitalize="none"
                                            autoCorrect={false}
                                            autoComplete="email"
                                            textContentType="emailAddress"
                                            returnKeyType="next"
                                            onSubmitEditing={() => passwordRef.current?.focus()}
                                        />
                                    )}
                                />
                                {errors.email && (
                                    <Text className="mt-1 text-xs text-red-500">{errors.email.message}</Text>
                                )}
                            </View>

                            {/* Пароль */}
                            <View className="mb-5">
                                <Text className="mb-2 text-sm font-medium text-slate-700">
                                    Пароль
                                </Text>
                                <Controller
                                    control={control}
                                    name="password"
                                    render={({ field: { onChange, onBlur, value } }) => (
                                        <TextInput
                                            ref={passwordRef}
                                            className={inputClass}
                                            value={value}
                                            onChangeText={onChange}
                                            onBlur={onBlur}
                                            placeholder="••••••••"
                                            placeholderTextColor="#94a3b8"
                                            secureTextEntry
                                            autoCapitalize="none"
                                            autoCorrect={false}
                                            autoComplete="new-password"
                                            textContentType="newPassword"
                                            returnKeyType="done"
                                            onSubmitEditing={handleSubmit(myOnSubmit)}
                                        />
                                    )}
                                />
                                {errors.password && (
                                    <Text className="mt-1 text-xs text-red-500">{errors.password.message}</Text>
                                )}
                            </View>

                            <Pressable
                                onPress={handleSubmit(myOnSubmit)}
                                disabled={isSubmitting}
                                className="h-14 mb-4 w-full items-center justify-center rounded-xl bg-indigo-600 active:bg-indigo-700"
                            >
                                <Text className="text-base font-semibold text-white">
                                    Реєстрація
                                </Text>
                            </Pressable>

                            <TouchableOpacity
                                onPress={() => router.replace("/login")}
                                className="h-14 w-full items-center justify-center rounded-xl bg-indigo-600 active:bg-indigo-700"
                            >
                                <Text className="text-base font-semibold text-white">
                                    Вхід
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableWithoutFeedback>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default RegisterScreen;