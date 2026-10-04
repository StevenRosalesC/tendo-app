# Tendo App

Proyecto móvil creado con [Expo](https://expo.dev), [Expo Router](https://docs.expo.dev/router/introduction/) (enrutamiento basado en archivos), [NativeWind v4](https://www.nativewind.dev) (Tailwind CSS) y [TypeScript](https://www.typescriptlang.org).

## 🚀 Comandos principales

Para iniciar el servidor de desarrollo:

```bash
# Iniciar Expo
npm start

# Iniciar en Android
npm run android

# Iniciar en iOS
npm run ios

# Iniciar en Web
npm run web
```

## 📁 Estructura del proyecto

- `app/_layout.tsx`: Layout raíz que inicializa `global.css`, `SafeAreaProvider` y el stack de navegación.
- `app/index.tsx`: Pantalla principal (`/`) con diseño en Tailwind CSS (`className`) y paleta de colores personalizada.
- `global.css`: Directivas de Tailwind CSS (`@tailwind base;`, etc.).
- `tailwind.config.js`: Configuración de Tailwind CSS con el preset de NativeWind y esquema de colores (`brand`, `surface`, `status`).
- `babel.config.js`: Preset de `nativewind/babel` y `babel-preset-expo`.
- `metro.config.js`: Adaptador Metro con `withNativeWind`.
- `nativewind-env.d.ts`: Tipos para NativeWind e importaciones CSS.
- `tsconfig.json`: Alias de importación `@/*` configurado.
