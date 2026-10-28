// useRef — хук для створення посилання (ref) на елемент, напр. на поле вводу
import { useRef } from 'react';
// Базові компоненти React Native
import {
    View,                       // контейнер (аналог div)
    Text,                       // текст
    TextInput,                  // поле вводу
    TouchableOpacity,           // кнопка, що напівпрозоріє при натисканні
    ScrollView,                 // прокручуваний контейнер
    KeyboardAvoidingView,       // піднімає вміст, щоб клавіатура не закривала поля
    Platform,                   // дає змогу дізнатися платформу: 'ios', 'android', 'web'
    Keyboard,                   // керування клавіатурою (напр. сховати її)
    TouchableWithoutFeedback, Pressable, // обробка натискань без візуального ефекту / універсальна кнопка
} from 'react-native';
// SafeAreaView — додає відступи, щоб вміст не залазив під виріз камери, статус-бар і нижню панель
import { SafeAreaView } from 'react-native-safe-area-context';
// router — навігація між екранами в Expo Router
import {router} from "expo-router";
// Тип даних форми: { email, password }
import {ILoginType} from "@/types/auth/ILoginType";
// react-hook-form: Controller — зв'язує поле вводу з формою, useForm — створює форму
import {Controller, useForm} from "react-hook-form";
// Адаптер, що підключає правила валідації zod до react-hook-form
import {zodResolver} from "@hookform/resolvers/zod";
// Правила валідації: коректна пошта і пароль від 6 символів
import {LoginSchema} from "@/schemas/LoginSchema";
// axios — бібліотека для HTTP-запитів на сервер
import axios from "axios";

// Компонент екрана входу
const LoginScreen = () => {
    // Посилання на поле пароля — через нього можна програмно поставити фокус на це поле
    const passwordRef = useRef(null);

    // Початкові значення полів форми
    const defaultValue: ILoginType = {
        email: "",
        password: "",
    }

    // Створюємо форму:
    // control — передається в кожен Controller, щоб поле стало частиною форми
    // handleSubmit — спершу перевіряє дані, і тільки якщо вони валідні, викликає нашу функцію
    // errors — об'єкт з помилками валідації по кожному полю
    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<ILoginType>({
        resolver: zodResolver(LoginSchema), // перевірка за правилами з LoginSchema
        defaultValues: defaultValue
    });

    // Адреса методу входу на сервері (AccountController.Login)
    const url = "https://salo.itstep.click/api/Account/Login";

    // Викликається після натиску «Увійти», лише якщо дані пройшли валідацію
    const myOnSubmit = async (data: ILoginType) => {

        try {
            // Надсилаємо { email, password } на сервер POST-запитом
            const result = await axios.post(url, data);
            console.log("Усіх status", result.status); // код відповіді, напр. 200
            console.log("Усіх data", result.data);     // тіло відповіді, напр. { token: "..." }
        }
        catch (error) {
            // Сюди потрапляємо при невірних даних (401) або помилці мережі
            console.log("Помилка", error);
        }

        // Виводимо в консоль об'єкт з поштою і паролем (вимога таски 24.10)
        console.log("Submit data ", data);
    }


    return (
        // <> </> — фрагмент: обгортка, яка не створює зайвого елемента на екрані
        <>
            {/* Безпечна зона екрана; flex-1 — займає всю доступну висоту */}
            <SafeAreaView className="flex-1">
                {/* Коли відкривається клавіатура, вміст зсувається вгору:
                    на iOS — додаванням відступу (padding), на Android — зміною висоти (height) */}
                <KeyboardAvoidingView
                    className="flex-1"
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
                >
                    {/* Прокрутка, щоб форма вміщалась на маленьких екранах і з відкритою клавіатурою.
                        contentContainerClassName — стилі внутрішнього вмісту (відступи, розтягування)
                        keyboardShouldPersistTaps="handled" — натиск на кнопку спрацьовує з першого разу, навіть коли відкрита клавіатура
                        keyboardDismissMode — ховати клавіатуру при прокрутці
                        automaticallyAdjustKeyboardInsets — на iOS автоматично додає місце під клавіатуру
                        showsVerticalScrollIndicator={false} — ховає смугу прокрутки */}
                    <ScrollView
                        className="flex-1"
                        contentContainerClassName="flex-grow px-6 py-10"
                        keyboardShouldPersistTaps="handled"
                        keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
                        automaticallyAdjustKeyboardInsets
                        showsVerticalScrollIndicator={false}
                    >
                        {/* На вебі клік по полю спливає до цього обгортання і Keyboard.dismiss знімає фокус, тому там його не викликаємо */}
                        {/* На телефоні дотик поза полями ховає клавіатуру.
                            accessible={false} — щоб програма читання з екрана не сприймала всю картку як одну кнопку */}
                        <TouchableWithoutFeedback onPress={Platform.OS === 'web' ? undefined : Keyboard.dismiss} accessible={false}>
                            {/* Біла картка форми: заокруглені кути, внутрішній відступ, тінь */}
                            <View className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
                                {/* Заголовок і підзаголовок */}
                                <Text className="mb-2 text-center text-3xl font-bold text-slate-900">
                                    Вхід
                                </Text>
                                <Text className="mb-8 text-center text-base text-slate-500">
                                    Увійдіть у свій акаунт
                                </Text>

                                {/* ---------- Поле «Електронна пошта» ---------- */}
                                <View className="mb-5">
                                    <Text className="mb-2 text-sm font-medium text-slate-700">
                                        Електронна пошта
                                    </Text>

                                    {/* Controller підключає TextInput до форми: передає поточне значення (value),
                                        функцію зміни (onChange) і втрати фокусу (onBlur).
                                        Якщо в полі помилка — рамка й фон червоні, інакше — сірі, а при фокусі рамка фіолетова.
                                        focus:-класи є в обох варіантах, щоб NativeWind не перебудовував поле і воно не втрачало фокус.
                                        keyboardType="email-address" — клавіатура з символом @
                                        autoCapitalize="none" — без автоматичної великої першої літери */}
                                    <Controller
                                        control={control}
                                        name="email"
                                        render={({field: {onChange, onBlur, value}}) => (
                                            <TextInput
                                                className={`mb-2 h-14 w-full rounded-xl border px-4 text-base text-slate-900 ${
                                                    errors.email
                                                        ? "border-red-500 bg-red-50 focus:border-red-500 focus:bg-red-50"
                                                        : "border-slate-300 bg-slate-50 focus:border-indigo-500 focus:bg-white"
                                                }`}
                                                value={value}
                                                onChangeText={onChange}
                                                onBlur={onBlur}
                                                placeholderTextColor="#94a3b8"
                                                keyboardType="email-address"
                                                autoCapitalize="none"
                                            />
                                        )}
                                    />

                                    {/* Текст помилки під полем — показується, лише якщо пошта не пройшла валідацію */}
                                    {errors.email && (
                                        <Text className="mt-1 text-xs text-red-500">{errors.email.message}</Text>
                                    )}
                                </View>

                                {/* ---------- Поле «Пароль» ---------- */}
                                <View className="mb-5">
                                    <Text className="mb-2 text-sm font-medium text-slate-700">
                                        Пароль
                                    </Text>

                                    {/* Так само підключене до форми поле пароля.
                                        ref={passwordRef} — посилання на це поле
                                        secureTextEntry — символи приховуються крапками */}
                                    <Controller
                                        control={control}
                                        name="password"
                                        render={({field: {onChange, onBlur, value}}) => (
                                            <TextInput
                                                ref={passwordRef}
                                                value={value}
                                                onBlur={onBlur}
                                                onChangeText={onChange}
                                                className={`mb-2 h-14 w-full rounded-xl border px-4 text-base text-slate-900 ${
                                                    errors.password
                                                        ? "border-red-500 bg-red-50 focus:border-red-500 focus:bg-red-50"
                                                        : "border-slate-300 bg-slate-50 focus:border-indigo-500 focus:bg-white"
                                                }`}
                                                placeholder="••••••••"
                                                placeholderTextColor="#94a3b8"
                                                secureTextEntry
                                                autoCapitalize="none"
                                            />
                                        )}
                                    />

                                    {/* Текст помилки під полем пароля */}
                                    {errors.password && (
                                        <Text className="mt-1 text-xs text-red-500">{errors.password.message}</Text>
                                    )}
                                </View>


                                {/* Кнопка «Увійти»: handleSubmit перевіряє форму і при валідних даних викликає myOnSubmit.
                                    active:bg-indigo-700 — кнопка темнішає під час натискання */}
                                <Pressable
                                    onPress={handleSubmit(myOnSubmit)}
                                    className="h-14 mb-4 w-full items-center justify-center rounded-xl bg-indigo-600 active:bg-indigo-700"

                                >
                                    <Text className="text-base font-semibold text-white">
                                        Увійти
                                    </Text>
                                </Pressable>

                                {/* Кнопка переходу на реєстрацію.
                                    router.replace замінює поточний екран, тому кнопкою «Назад» на вхід не повернутися */}
                                <TouchableOpacity
                                    onPress={() => router.replace("/register")}
                                    className="h-14 w-full items-center justify-center rounded-xl bg-indigo-600 active:bg-indigo-700">
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

// Expo Router бере default-експорт файлу як екран.
// Файл app/(auth)/login.tsx відкривається за адресою /login (група в дужках у адресу не входить)
export default LoginScreen;