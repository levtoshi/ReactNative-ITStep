import {
    View,
    Text,
    Image,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Redirect, router} from "expo-router";
import * as SecureStore from "expo-secure-store";
import {useAppDispatch, useAppSelector} from "@/store";
import {logout} from "@/store/reducers/AuthSlice";
import {API_BASE_URL} from "@/api/config";

// Один рядок профілю: підпис зверху, значення нижче
const InfoRow = ({label, value}: { label: string; value: string }) => (
    <View className="mb-5">
        <Text className="mb-1 text-sm font-medium text-slate-500">{label}</Text>
        <Text className="text-base text-slate-900">{value}</Text>
    </View>
);

const ProfileScreen = () => {
    // Дані користувача беремо з Redux: вони розібрані з JWT-токена (email, name, image, roles)
    const {user} = useAppSelector(state => state.auth);
    const dispatch = useAppDispatch();

    const onLogout = async () => {
        // Видаляємо токен із захищеного сховища і очищаємо користувача в Redux.
        // Після цього user === undefined, і Redirect нижче сам перекидає на /login
        await SecureStore.deleteItemAsync("token");
        dispatch(logout());
    };

    // Якщо користувач не увійшов (напр. відкрили /profile напряму) — відправляємо на вхід
    if (!user) {
        return <Redirect href="/login"/>;
    }

    // Якщо в користувача одна роль, сервер кладе її в токен рядком, а не масивом.
    // concat зводить обидва випадки до масиву
    const roles = ([] as string[]).concat(user.roles ?? []);

    // На сервері фото зберігається в кількох розмірах: {id}_64.webp, _432.webp, _800.webp, _1280.webp.
    // Для аватарки вистачає 432. Якщо фото не вибирали, в токені порожній рядок
    const photoUrl = user.image ? `${API_BASE_URL}/images/${user.image}_432.webp` : null;

    const fullName = user.name.trim();

    return (
        <SafeAreaView className="flex-1">
            <ScrollView
                className="flex-1"
                contentContainerClassName="flex-grow px-6 py-10"
                showsVerticalScrollIndicator={false}
            >
                <View className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
                    <Text className="mb-6 text-center text-3xl font-bold text-slate-900">
                        Профіль користувача
                    </Text>

                    {/* Фото: саме фото в колі, а без фото — перша літера імені */}
                    <View className="mb-8 items-center">
                        {photoUrl ? (
                            <Image
                                source={{uri: photoUrl}}
                                className="h-36 w-36 rounded-full bg-slate-100"
                            />
                        ) : (
                            <View className="h-36 w-36 items-center justify-center rounded-full bg-indigo-100">
                                <Text className="text-6xl font-bold text-indigo-600">
                                    {fullName ? fullName[0].toUpperCase() : "?"}
                                </Text>
                            </View>
                        )}
                    </View>

                    <InfoRow label="Прізвище та ім'я" value={fullName || "—"}/>
                    <InfoRow label="Електронна пошта" value={user.email}/>

                    {/* Ролі користувача (User, Admin) показуємо плашками */}
                    <View className="mb-8">
                        <Text className="mb-2 text-sm font-medium text-slate-500">Ролі</Text>
                        <View className="flex-row flex-wrap gap-2">
                            {roles.length > 0 ? (
                                roles.map((role) => (
                                    <View key={role} className="rounded-full bg-indigo-50 px-4 py-1">
                                        <Text className="text-sm font-medium text-indigo-700">{role}</Text>
                                    </View>
                                ))
                            ) : (
                                <Text className="text-base text-slate-900">—</Text>
                            )}
                        </View>
                    </View>

                    {/* Перехід на екран чату (завдання 11.11) */}
                    <TouchableOpacity
                        onPress={() => router.push("/mychat")}
                        className="mb-4 h-14 w-full items-center justify-center rounded-xl bg-indigo-600 active:bg-indigo-700"
                    >
                        <Text className="text-base font-semibold text-white">
                            Відкрити чат
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={onLogout}
                        className="h-14 w-full items-center justify-center rounded-xl bg-red-600 active:bg-red-700"
                    >
                        <Text className="text-base font-semibold text-white">
                            Вийти з акаунта
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default ProfileScreen;
