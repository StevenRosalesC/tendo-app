# 🛒 Tendo App - Modern POS & Inventory Management System

<p align="center">
  <strong>Cross-platform Point of Sale (POS) and inventory management application built with Expo SDK 57, React Native, TypeScript, and NativeWind (Tailwind CSS).</strong>
</p>

<p align="center">
  <a href="#english">English</a> • <a href="#español">Español</a>
</p>

---

<a name="english"></a>
## 🌐 English

### 📖 About the Project

**Tendo App** is an enterprise-grade, omnichannel Point of Sale (POS) and inventory management system designed for retail stores, supermarkets, and specialty shops. It provides cashiers and store managers with a lightning-fast, touch-friendly, and keyboard-aware checkout experience across mobile devices (Android & iOS) and desktop web browsers.

### ✨ Key Features

- **⚡ High-Performance POS Terminal**:
  - Dual-panel desktop cockpit workstation and mobile-optimized single-cart layout.
  - Barcode scanning via camera or external USB/Bluetooth barcode readers.
  - Fractional and weight-based items with live pricing calculations.
  - Dedicated **Discount Modal** with 1-tap quick presets (`5%`, `10%`, `15%`, `20%`) and custom percentage/fixed-amount modes with real-time financial previews.
  - Ticket holding, manual product lookup, and customer profile assignment.

- **📦 Real-Time Inventory & Catalog**:
  - Live stock valuation KPIs (total assets, retail value, margin estimates).
  - Low-stock and critical inventory alerts.
  - Product creation and editing modals with image upload and unit configuration (`UNIT`, `KG`, `LT`, etc.).
  - Instant CSV export and sharing.

- **🔐 Enterprise Authentication & RBAC**:
  - Powered by [Clerk](https://clerk.com) with organization multi-tenancy.
  - Granular Role-Based Access Control (`ADMIN`, `MANAGER`, `CASHIER`).
  - Secure biometric, password, Google Workspace SSO, and Device Trust / MFA verification.

- **🔄 Real-Time Telemetry & WebSockets**:
  - Socket.IO integration for live checkout events and multi-device synchronizations.

- **📱 Optimized Mobile UX & Keyboard Intelligence**:
  - NativeWind v4 (Tailwind CSS) dark-theme aesthetic.
  - Dynamic virtual keyboard height detection and viewport compensation on Android and iOS to prevent input obstruction.

---

### 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| **[Expo SDK 57](https://expo.dev)** | Universal application platform & native tooling |
| **[React Native 0.86](https://reactnative.dev)** | Native mobile rendering engine |
| **[Expo Router](https://docs.expo.dev/router/introduction/)** | File-based routing & deep linking |
| **[NativeWind v4](https://www.nativewind.dev)** | Tailwind CSS styling for React Native |
| **[TypeScript](https://www.typescriptlang.org)** | End-to-end type safety |
| **[Clerk](https://clerk.com)** | Enterprise authentication, session handling & RBAC |
| **[TanStack Query v5](https://tanstack.com/query)** | Asynchronous server-state caching & synchronization |
| **[Zustand](https://zustand.docs.pmnd.rs)** | Lightweight client state management for cart & active ticket |
| **[Socket.IO Client](https://socket.io)** | Real-time WebSocket gateway communication |

---

### 🚀 Getting Started

#### Prerequisites
- Node.js (v18+ recommended)
- npm, yarn, or bun
- [Expo Go](https://expo.dev/go) app installed on your physical mobile device, or an Android/iOS emulator.

#### 1. Clone the repository
```bash
git clone https://github.com/StevenRosalesC/tendo-app.git
cd tendo-app
```

#### 2. Install dependencies
```bash
npm install
```

#### 3. Environment variables
Copy the example environment file and configure your keys:
```bash
cp .env.example .env
```

Edit `.env` with your actual credentials:
```env
# Clerk Authentication
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...

# Tendo Backend REST API
EXPO_PUBLIC_API_URL=http://localhost:8000/api

# Tendo WebSocket Gateway
EXPO_PUBLIC_WS_URL=http://localhost:8000
```

#### 4. Run the development server
```bash
# Start the Expo development bundler
npm start

# Run on Android emulator / device
npm run android

# Run on iOS simulator
npm run ios

# Run in Web browser
npm run web
```

#### 5. Build for Production (Web)
```bash
npm run build:web
```
This generates the optimized production bundle inside the `dist/` directory, ready to be deployed to Vercel, Netlify, Cloudflare Pages, or EAS Hosting.

---

### 📂 Directory Structure

```
├── app/                  # Expo Router file-based screens and layouts
│   ├── (app)/            # Authenticated application routes
│   │   ├── home/         # Dashboard & daily KPI metrics
│   │   ├── terminal/     # Point of Sale (POS) checkout workstation
│   │   ├── inventory/    # Catalog & inventory management
│   │   ├── reports/      # Sales & profitability reports
│   │   └── settings/     # Store & team management
│   ├── (auth)/           # Authentication screens (Login, Register, MFA, Password reset)
│   ├── _layout.tsx       # Root layout (Clerk, QueryClient, Safe Area)
│   └── index.tsx         # Splash screen and authentication router
├── components/           # Reusable UI & business domain components
│   ├── auth/             # Authentication headers, footers & showcases
│   ├── inventory/        # Inventory tables, toolbars, cards & forms
│   ├── layout/           # Desktop sidebars, mobile headers & navigators
│   ├── orders/           # Global order drawer & ticket manager
│   ├── terminal/         # POS cart, summary, product grid & discount modals
│   └── ui/               # Core atomic design components (Button, Modal, Input, Badge)
├── hooks/                # Custom React hooks (useKeyboard, usePermissions, usePosSocket)
├── providers/            # React context providers (QueryProvider)
├── services/             # API client, HTTP services & endpoints
├── stores/               # Zustand state stores (useCartStore, useAuthStore)
└── types/                # TypeScript shared interfaces and permission enums
```

---

<a name="español"></a>
## 🇪🇸 Español

### 📖 Acerca del Proyecto

**Tendo App** es una plataforma moderna y omnicanal de Punto de Venta (POS) y administración de inventario diseñada para comercios, tiendas de conveniencia y sucursales comerciales. Ofrece a cajeros y gerentes de tienda una experiencia ágil, táctil y libre de bloqueos por teclado en dispositivos móviles (Android e iOS) y navegadores web de escritorio.

### ✨ Características Principales

- **⚡ Terminal POS de Alto Rendimiento**:
  - Vista dual tipo *cockpit* para escritorio/tablets y vista compacta de una sola mano para teléfonos.
  - Escaneo de código de barras mediante cámara integrada o lectores USB/Bluetooth externos.
  - Soporte de productos fraccionados y venta por peso (`KG`, `LT`) con cálculo en tiempo real.
  - **Modal de Descuento** dedicado con botones rápidos de 1 toque (`5%`, `10%`, `15%`, `20%`) y modo manual por porcentaje o monto fijo con previsualización en vivo.
  - Retención de tickets, búsqueda manual de artículos y asignación de clientes.

- **📦 Inventario y Catálogo en Tiempo Real**:
  - Métricas KPI de valuación de existencias (costo total, valor de venta comercial, utilidad estimada).
  - Alertas automáticas de stock crítico y reorden.
  - Formularios de alta y edición de productos con carga de imágenes y asignación de códigos de barras.
  - Exportación instantánea a archivo CSV.

- **🔐 Autenticación Corporativa y Roles (RBAC)**:
  - Integración nativa con [Clerk](https://clerk.com) y soporte de múltiples sucursales (Organizations).
  - Permisos granulares por rol (`ADMIN`, `MANAGER`, `CASHIER`).
  - Verificación biométrica, contraseñas seguras, Google Workspace SSO y Device Trust (MFA).

- **🔄 Sincronización en Vivo por WebSockets**:
  - Conexión Socket.IO para eventos de venta y actualización instantánea entre dispositivos.

- **📱 Experiencia Móvil Optimizada**:
  - Interfaz NativeWind v4 (Tailwind CSS) con estética oscura moderna.
  - Detección dinámica de la altura del teclado virtual en Android e iOS para evitar la superposición de campos y permitir un desplazamiento fluido.

---

### 🚀 Instalación y Puesta en Marcha

#### 1. Clonar el repositorio
```bash
git clone https://github.com/StevenRosalesC/tendo-app.git
cd tendo-app
```

#### 2. Instalar dependencias
```bash
npm install
```

#### 3. Variables de entorno
Copia la plantilla de variables de entorno:
```bash
cp .env.example .env
```
Configura tus claves de Clerk y URLs de la API en `.env`.

#### 4. Iniciar en desarrollo
```bash
# Iniciar Metro Bundler
npm start

# Iniciar en Android
npm run android

# Iniciar en iOS
npm run ios

# Iniciar en Web
npm run web
```

#### 5. Compilar para Producción (Web)
```bash
npm run build:web
```
Genera la carpeta `dist/` optimizada para desplegar en Vercel, Netlify, Cloudflare Pages o EAS Hosting.

---

### 📄 Licencia

Este proyecto está distribuido bajo la licencia MIT. Consulta el archivo `LICENSE` para más información.
