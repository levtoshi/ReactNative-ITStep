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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const RegisterScreen = () => {
    const passwordRef = useRef(null);

    return (
        <>
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

                                <Text className="mb-2 text-sm font-medium text-slate-700">
                                    Електронна пошта
                                </Text>
                                <TextInput
                                    className="mb-5 h-14 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 text-base text-slate-900 focus:border-indigo-500 focus:bg-white"
                                    placeholder="example@mail.com"
                                    placeholderTextColor="#94a3b8"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    autoComplete="email"
                                    textContentType="emailAddress"
                                    returnKeyType="next"
                                />

                                <Text className="mb-2 text-sm font-medium text-slate-700">
                                    Пароль
                                </Text>
                                <TextInput
                                    ref={passwordRef}
                                    className="mb-8 h-14 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 text-base text-slate-900 focus:border-indigo-500 focus:bg-white"
                                    placeholder="••••••••"
                                    placeholderTextColor="#94a3b8"
                                    secureTextEntry
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    autoComplete="password"
                                    textContentType="password"
                                    returnKeyType="done"
                                    onSubmitEditing={Keyboard.dismiss}
                                />

                                <TouchableOpacity className="h-14 w-full items-center justify-center rounded-xl bg-indigo-600 active:bg-indigo-700">
                                    <Text className="text-base font-semibold text-white">
                                        Реєстрація
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableWithoutFeedback>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </>
    )
}

export default RegisterScreen;