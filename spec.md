# Specification: ReactNative-P34 (Salo)

Технічна специфікація проєкту: структура, стек, залежності, архітектура, ризики.
Оновлювати при суттєвих змінах архітектури або стеку.

---

## 1. Огляд

Репозиторій містить мобільний клієнт і серверну частину простого сервісу автентифікації користувачів із профілем та аватаром.

| Компонент | Призначення | Статус |
|---|---|---|
| `app/` | Мобільний/веб клієнт (Expo, React Native) | Активна розробка |
| `WebAPISalo/` | REST API (ASP.NET Core 9) + Identity + PostgreSQL | Активна розробка |
| `AndroidApp/` | Android-застосунок на Java (шаблон "Empty Views Activity") | Не пов'язаний з API, ігнорувати |
| `salo.itstep.click/` | Docker Compose для продакшену (API, PostgreSQL, бекапи) | Продакшен |
| `build_and_push.bat` | Збірка і публікація Docker-образу API | Продакшен |

Продакшен-домен: `https://salo.itstep.click` (nginx → `localhost:8254` → контейнер API).

---

## 2. Структура репозиторію

```
ReactNative-P34/
├── app/                      # Expo-клієнт
│   ├── src/app/              # Expo Router (файлові маршрути)
│   │   ├── _layout.tsx       # Кореневий layout: відновлення сесії, Redux Provider
│   │   ├── index.tsx         # Редірект: /profile або /login
│   │   ├── (auth)/login.tsx, register.tsx
│   │   ├── (profile)/profile.tsx, _layout.tsx
│   │   └── explore.tsx       # Залишок шаблону Expo
│   ├── src/store/            # Redux Toolkit: store + AuthSlice
│   ├── src/schemas/          # zod-схеми форм (Login, Register, Profile)
│   ├── src/types/            # TypeScript-інтерфейси (IUser, IAuthResponse, ...)
│   ├── src/components/       # UI-компоненти (частина — шаблон Expo)
│   ├── src/hooks/, constants/, global.css
│   ├── app.json, babel.config.js, metro.config.js, tailwind.config.js, tsconfig.json
│   ├── AGENTS.md             # Правила для AI-агентів щодо Expo/EAS
│   └── package.json, package-lock.json (npm)
├── WebAPISalo/
│   ├── WebAPISalo.slnx
│   ├── Dockerfile            # Multi-stage: SDK 9 → ASP.NET 9 runtime
│   └── WebAPISalo/
│       ├── Program.cs        # Композиція DI, JWT, Swagger, статика, seed
│       ├── Controllers/      # AccountController (+ WeatherForecast — шаблон)
│       ├── Services/         # ImageService, JwtTokenService
│       ├── Interfaces/       # IImageService, IJwtTokenService
│       ├── Data/             # MyDbContext, Identity-сутності
│       ├── Migrations/       # EF Core-міграції (AddIdentityTabels)
│       ├── Models/Account/   # LoginModel, RegisterModel (DTO)
│       ├── Constants/        # Roles
│       ├── images/           # Приклад збережених WebP-зображень
│       └── appsettings*.json
├── AndroidApp/               # Gradle-проєкт, Java, package com.example.myfristapp
├── salo.itstep.click/        # docker-compose.yml, .env (секрети — не коміть значення)
├── build_and_push.bat
├── README.md                 # Налаштування nginx + certbot
├── CLAUDE.md                 # Інструкції для Claude Code
└── spec.md                   # Цей файл
```

Зауваження: батьківська директорія `40.ReactNative P34/` містить `HomeWork*.txt` та інші навчальні файли, які не належать до проєкту.

---

## 3. Технологічний стек

### 3.1 Клієнт (`app/`)

| Категорія | Технологія | Версія (package.json) |
|---|---|---|
| Платформа | Expo SDK | `expo ~58.0.16` |
| UI-рантайм | React Native | `0.88.0` |
| UI-бібліотека | React | `19.3.0` (`reactCompiler: true` в `app.json`) |
| Навігація | Expo Router (file-based, `typedRoutes: true`) | `~58.0.24` |
| Стилі | NativeWind + Tailwind CSS | `nativewind ^4.2.7`, `tailwindcss ^3.4.19` |
| Стан | Redux Toolkit + react-redux | `@reduxjs/toolkit ^2.13.0`, `react-redux ^9.3.1` |
| Форми | react-hook-form + zod + @hookform/resolvers | `^7.90.0`, `zod ^4.6.7`, `^5.9.2` |
| HTTP | axios | `^1.20.0` |
| JWT | jwt-decode | `^4.0.0` |
| Збереження токена | expo-secure-store | `^15.0.8` |
| Вибір фото | expo-image-picker | `^17.0.10` |
| Multipart | object-to-formdata | `^5.0.0` |
| Анімації/жести | react-native-reanimated, react-native-gesture-handler, react-native-worklets | `^4.7.1`, `~3.3.0`, `0.13.0` |
| Веб-таргет | react-native-web, react-dom | `~0.21.4`, `19.3.0` (`web.output: "server"`) |
| Мова | TypeScript (strict) | `~6.0.3` |
| Інструменти | prettier-plugin-tailwindcss, @expo/ngrok, expo-doctor (через npx) | dev |

Інші Expo-модулі: expo-constants, expo-device, expo-font, expo-glass-effect, expo-image, expo-linking, expo-splash-screen, expo-status-bar, expo-symbols, expo-system-ui, expo-web-browser, @expo/ui.

### 3.2 Бекенд (`WebAPISalo/`)

| Категорія | Технологія | Версія |
|---|---|---|
| Рантайм | .NET / ASP.NET Core | `net9.0` |
| ORM | EF Core + Npgsql | `Npgsql.EntityFrameworkCore.PostgreSQL 9.0.4`, EF Tools `9.0.21` |
| Ідентичність | ASP.NET Core Identity (EF Core store) | `Microsoft.AspNetCore.Identity.EntityFrameworkCore 9.0.21` |
| Автентифікація | JWT Bearer (HS256) | `Microsoft.AspNetCore.Authentication.JwtBearer 9.0.22` |
| Зображення | SkiaSharp (+ Linux native assets) | `4.154.0` |
| API-документація | Swashbuckle (Swagger UI) | `9.0.6` |
| База даних | PostgreSQL | `postgres:18.1` (Docker) |

### 3.3 Android (`AndroidApp/`) — не пов'язаний з API

- AGP `9.4.1`, minSdk 24, targetSdk/compileSdk 37, Java 11.
- AndroidX AppCompat 1.6.1, Material 1.10.0, ConstraintLayout 2.1.4, Activity KTX 1.8.0.
- Тести: JUnit 4.13.2, Espresso 3.5.1 (лише шаблонні `ExampleUnitTest`/`ExampleInstrumentedTest`).
- Одна `MainActivity` з `activity_main.xml`, без логіки API.

### 3.4 Інфраструктура

- Docker: образ `novakvova/salo-api:latest` (збірка через `build_and_push.bat`).
- `docker-compose.yml`: сервіси `postgresSaloServerDb` (порт 5212→5432), `api` (порт 8254→8080), `db-backup` (щоденний `pg_dump` у `./backups`).
- nginx на хості: proxy `salo.itstep.click` і `*.salo.itstep.click` на `localhost:8254`, `client_max_body_size 200M`, TLS через certbot.
- Збірка мобільного клієнта: EAS (`eas build`, `eas submit`, `eas update`), згідно з `app/AGENTS.md`.

---

## 4. Архітектурні рішення

### 4.1 Клієнт

**Шари:**

1. **Маршрутизація** — Expo Router. Групи `(auth)` і `(profile)`. Редірект у `index.tsx` залежить від наявності `user` у Redux.
2. **Стан** — один Redux-слайс `auth` (`AuthSlice.ts`). Зберігає декодовані JWT-claims (`IUser`) разом із сирим `token`.
3. **Персистентність** — токен у `expo-secure-store` під ключем `"token"`. Відновлення сесії — у кореневому `_layout.tsx` при старті (dispatch `loginSuccess`).
4. **Форми** — react-hook-form з zod-валідацією (`src/schemas/`).
5. **Мережа** — axios, прямі виклики з екранів (без сервісного шару і без централізованого інстансу axios).
6. **Стилі** — NativeWind: класи Tailwind через `className`; кольори в основному `slate`/`indigo`.

**Потік автентифікації:**

```
Login.tsx ──POST /api/Account/Login {email,password}──▶ API
          ◀──────────── 200 { token } ──────────────────
          SecureStore.set("token", token)
          dispatch(loginSuccess(token))  → decode JWT → state.auth.user
          router.push("/profile")

App start: _layout.tsx → SecureStore.get("token") → dispatch(loginSuccess)
Logout:    profile.tsx → SecureStore.delete("token") → dispatch(logout) → /login
```

**Модель клієнта:** `IUser { email, name, roles[], image, exp, token }`. Поля беруться з claims JWT (`email`, `name`, `roles`, `image`, `exp`).

### 4.2 Бекенд

**Шари:**

1. **Контролери** — `AccountController` з маршрутами `api/Account/{Login|Register|GetAll}`.
2. **Сервіси** — `JwtTokenService` (видача токена), `ImageService` (обробка зображень). Реєструються як `Scoped`, інтерфейси в `Interfaces/`.
3. **Ідентичність** — `UserManager`/`RoleManager` ASP.NET Identity; сутності `UserEntity : IdentityUser<long>`, `RoleEntity`, `UserRoleEntity`.
4. **Персистентність** — `MyDbContext : IdentityDbContext<…, long, …>` з PostgreSQL. Міграції застосовуються при старті.
5. **Статика** — `images/` віддається за `/images` через `UseStaticFiles`.
6. **Документація** — Swagger з Bearer-схемою, XML-коментарі (`GenerateDocumentationFile`).

**Конвеєр запиту:** `UseSwagger/UseSwaggerUI` → `UseAuthentication` → `UseAuthorization` → `MapControllers`. Статика підключається до цього конвеєра раніше.

**Налаштування Identity:** довжина пароля ≥ 6, без інших вимог. Email використовується як `UserName`. `EmailConfirmed = true` (підтвердження пошти не реалізоване).

**JWT:**
- Підпис HS256, ключ з `Jwt:Key` (`appsettings.json`).
- Термін дії 7 днів, `ClockSkew = 0`, `ValidateIssuer/Audience = false`.
- Claims: `email`, `name` (`"{LastName} {FirstName}"`), `image` (GUID зображення), `roles` (по одному на роль).

**Ролі:** `Admin`, `User` (`Constants/Roles.cs`). Нові користувачі отримують `User`. Сід створює `admin@gmail.com` та `user@gmail.com`, якщо таблиця користувачів порожня.

### 4.3 Модель даних

Схема Identity (PostgreSQL, EF Core):

| Таблиця | Опис |
|---|---|
| `AspNetUsers` | `UserEntity`: `Id (long)`, `UserName`, `Email`, пароль-хеш, `FirstName`, `LastName`, `Image` (GUID), `DateCreated` (UTC) |
| `AspNetRoles` | `RoleEntity`: `Admin`, `User` |
| `AspNetUserRoles` | `UserRoleEntity` (зв'язок користувач–роль) |
| `AspNetUserClaims`, `AspNetUserLogins`, `AspNetUserTokens`, `AspNetRoleClaims` | Стандартні таблиці Identity (не використовуються явно) |

Міграція: `20261024170414_AddIdentityTabels`.

### 4.4 Обробка зображень

1. Клієнт вибирає фото (`expo-image-picker`), передає як multipart (`ImageFile`).
2. `ImageService` декодує через SkiaSharp і паралельно зберігає WebP у розмірах з `ImageSizes` (зараз `64, 432, 800, 1280`) з бічною стороною, не більшою за розмір.
3. Файли: `images/{GUID}_{size}.webp`. GUID записується в `UserEntity.Image` і в JWT-claim `image`.
4. Клієнт формує URL з GUID і потрібним розміром. Логіка формування URL у клієнті ще не реалізована або лежить поза цим репозиторієм.

Файли лежать на локальній файловій системі контейнера (`Directory.GetCurrentDirectory()`). Для зберігання поза контейнером потрібен volume (зараз `VOLUME_SERVERAPI` у `.env`).

### 4.5 Конфігурація

| Джерело | Ключі |
|---|---|
| `appsettings.json` | `Jwt:Key`, `ConnectionStrings:DefaultConnection` (порожній), `ImagesDir`, `ImageSizes` |
| Змінні середовища (Docker) | `ConnectionStrings__DefaultConnection`, `ASPNETCORE_ENVIRONMENT=Production` |
| `salo.itstep.click/.env` | `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `VOLUME_POSTGRES`, `VOLUME_SERVERAPI` |
| Клієнт | Немає env-конфігурації; URL API захардкоджено в трьох екранах |

---

## 5. Залежності між компонентами

```
[Expo-клієнт] ──HTTPS (axios, JSON / multipart)──▶ [nginx :443]
                                                       │ proxy
                                                       ▼
                                           [ASP.NET API :8254→8080]
                                             │              │
                                 EF Core/Npgsql│              │ файлова система
                                             ▼              ▼
                                 [PostgreSQL :5212]   [images/*.webp]
                                             ▲
                                 [db-backup: pg_dump щодня]
```

Клієнт і API з'єднані лише контрактом HTTP. Спільного коду немає. Контракт описаний у `AccountController`, `RegisterModel`, `LoginModel` і типах `app/src/types/`.

---

## 6. Контракт API (поточний)

| Метод | Шлях | Auth | Тіло | Відповідь |
|---|---|---|---|---|
| POST | `/api/Account/Login` | — | JSON `{ email, password }` | `200 { token }` / `401 { error }` |
| POST | `/api/Account/Register` | — | multipart: `FirstName, LastName, Email, Password, ImageFile?` | `200 { token }` / `400 { error }` або `400 { erroor }` |
| GET | `/api/Account/GetAll` | Bearer | — | `200` список `{ Id, Email, FirstName, LastName, Image, Registered }` |
| GET | `/images/{file}` | — | — | файл WebP |

Відомі відхилення: `erroor` (помилка в назві ключа при реєстрації); `Register` використовується і для збереження профілю з `profile.tsx`.

---

## 7. Ризики та технічний борг

Відсортовано за серйозністю.

| # | Ризик | Де | Наслідок | Пропозиція |
|---|---|---|---|---|
| 1 | **JWT-ключ у `appsettings.json` в git** | `WebAPISalo/.../appsettings.json` | Будь-хто з доступом до репо може підписувати токени | Перенести в User Secrets / env, ротувати ключ |
| 2 | **`GetAll` доступний будь-якому автентифікованому користувачу** | `AccountController.GetAll` | Звичайний `User` бачить email і ПІБ усіх користувачів | Додати `[Authorize(Roles = Roles.Admin)]` |
| 3 | **Відкриті тестові облікові дані в seed** | `Program.cs` (`Admin123`, `User123`) | Вхід в адмін-акаунт, якщо seed потрапив у продакшен-БД | Прибрати seed з Production або генерувати паролі |
| 4 | **Збереження профілю через `/Register`** | `profile.tsx` | Немає оновлення профілю; запит створить нового користувача або поверне помилку | Додати `PUT /api/Account/Profile` (`[Authorize]`) |
| 5 | **Hardcoded base URL** | `login.tsx`, `register.tsx`, `profile.tsx` | Зміна хоста вимагає правок у трьох місцях | Винести в `app.config.ts` / `EXPO_PUBLIC_API_URL` |
| 6 | **Swagger увімкнений у продакшені** | `Program.cs` | Розкриває повний контракт API | Вмикати лише в Development |
| 7 | **Немає CORS, HTTPS-редіректу; `RequireHttpsMetadata = false`** | `Program.cs` | Веб-клієнт (`react-native-web`) не працюватиме з іншого origin; JWT може йти по HTTP | Явна CORS-політика; `RequireHttpsMetadata = true` за TLS |
| 8 | **Токен не відкликається** | JWT 7 днів без refresh/blacklist | Викрадений токен валідний тиждень | Коротший термін + refresh-токени, або оновлення `SecurityStamp` при logout |
| 9 | **Відсутні тести** | обидва проєкти | Регресії не ловляться | Jest + React Native Testing Library; xUnit + `WebApplicationFactory` |
| 10 | **Лінт не налаштований** | `app/` | `npm run lint` не працює коректно | Додати ESLint (`eslint-config-expo`) |
| 11 | **Нестабільний `useEffect` у кореневому layout** | `src/app/_layout.tsx` | Без масиву залежностей, виконується при кожному рендері; `initStore` викликається повторно | Додати `[]` |
| 12 | **Початковий стан `auth` завжди порожній** | `AuthSlice.ts` (`token = undefined`) | Коректне відновлення тільки через `_layout` | Прибрати мертвий код або ініціалізувати з SecureStore |
| 13 | **Помилка в ключі відповіді** | `AccountController.Register` (`erroor`) | Клієнт не бачить текст помилки | Виправити на `error` |
| 14 | **Зображення на локальному диску контейнера** | `ImageService` | Втрата при перестворенні контейнера без volume | Переконатися, що `VOLUME_SERVERAPI` змонтовано; розглянути blob-сховище |
| 15 | **Залишки шаблонів** | `WeatherForecast*`, `explore.tsx`, `components/ui`, `AndroidApp/` | Шум у проєкті, плутанина | Видалити |
| 16 | **Пароль і email у логах клієнта** | `console.log` у `login.tsx`, `profile.tsx` (`data`) | Персональні дані в логах | Прибрати логування даних форм |
| 17 | **Дубльовані `StyleSheet`/класи та імпорти** | `login.tsx`, `register.tsx`, `profile.tsx` | Копіпаст, важко змінювати | Винести спільні компоненти форм |
| 18 | **Немає версіонування API і обробки помилок** | API | Зміна контракту ламає клієнт без попередження | Уніфікований формат помилок (ProblemDetails) |

---

## 8. Команди (довідник)

Повний список — у `CLAUDE.md`.

```bash
# Клієнт (app/)
npx expo start
npx tsc --noEmit
npx expo install <pkg>

# Бекенд (корінь)
dotnet build WebAPISalo/WebAPISalo/WebAPISalo.csproj
dotnet run --project WebAPISalo/WebAPISalo
dotnet ef migrations add <Name> --project WebAPISalo/WebAPISalo

# Публікація API
build_and_push.bat
```

---

## 9. Відкриті питання

1. Чи планується оновлення профілю (ім'я, фото), і який endpoint для цього використовувати?
2. Чи потрібна роль `Admin` в інтерфейсі, чи лише `GetAll` на бекенді?
3. Цільові платформи: лише iOS/Android, чи також веб (`web.output: "server"` вказує на SSR-експеримент)?
4. Де має жити сховище зображень у продакшені: локальний volume чи зовнішнє (S3/Blob)?
5. Чи є план прибрати `AndroidApp/` з репозиторію?
