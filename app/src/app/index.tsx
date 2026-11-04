import {Redirect} from "expo-router";

import '@/global.css';
import {useAppSelector} from "@/store";

export default function HomeScreen() {

  const { user } = useAppSelector(x=>x.auth)

  if (user)
    return <Redirect href="/profile" />

  return <Redirect href="/login"/>

}
