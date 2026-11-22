# AKX Android build

AKX now has a Capacitor Android packaging path. The existing HTML/CSS/JavaScript app remains the source of the UI and game logic; Capacitor packages those local assets inside an Android application so the launcher opens AKX directly rather than launching Chrome.

## Build locally

1. Install Node.js 22 and Android Studio with Android SDK tools.
2. Run `npm install`.
3. Run `npm run build:web`.
4. Run `npx cap add android` (only once per local checkout).
5. Run `npx cap sync android`.
6. Open the `android` folder in Android Studio, or run `cd android && ./gradlew assembleDebug`.

The debug APK is created at `android/app/build/outputs/apk/debug/app-debug.apk`.

## Build through GitHub Actions

Open the repository's Actions tab and run **Build AKX Android APK** using **Run workflow** on the `android-native-setup` branch. Download the `AKX-Android-debug` artifact after the workflow succeeds.

## Important notes

- This packages the existing web-based UI in a native Android shell; it does not rewrite the app in Kotlin/Jetpack Compose.
- Existing records use browser localStorage/IndexedDB. Treat the first Android installation as a separate app data store from Chrome/PWA data. Export an AKX JSON backup before moving devices or changing installation methods. Book PDFs in IndexedDB are not included in that JSON backup, as documented in the app.
- The first build is a debug APK for testing. A Play Store release requires a separately signed release AAB, app signing credentials, privacy/policy review, and device testing.
- Features that load third-party libraries or AI services from the internet still require an internet connection unless separately bundled or given an offline implementation.
