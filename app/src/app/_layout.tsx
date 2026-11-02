import {Stack} from 'expo-router';
import {SafeAreaProvider} from "react-native-safe-area-context";
import {Provider} from "react-redux";
import {store} from "@/store";


export default function TabLayout() {
    return (
        <Provider store={store}>
            <SafeAreaProvider>
                <Stack screenOptions={{headerShown: false}}/>
            </SafeAreaProvider>
        </Provider>
    )
}
