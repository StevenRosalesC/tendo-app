import { useClerk, useSignIn, useSSO } from "@clerk/expo";
import { MaterialIcons,FontAwesome } from "@expo/vector-icons";
import { useRouter,Link } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ImageBackground,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginPage() {
  const router = useRouter();
  const { signIn, errors, fetchStatus } = useSignIn();
  const { startSSOFlow } = useSSO();
  const clerk = useClerk();

  // Local state
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Commented states for future PIN and station selection implementation:
  // const [authMode, setAuthMode] = useState<"email" | "pin">("email");
  // const [pin, setPin] = useState<string[]>(["", "", "", ""]);
  // const [stationName, setStationName] = useState<string>("Caja Principal 01");

  // Handle Google SSO / Workspace
  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      const result = await startSSOFlow({ strategy: "oauth_google" });
      if (result.createdSessionId) {
        await result.setActive?.({ session: result.createdSessionId });
        router.replace("/home");
      }
    } catch (err: any) {
      console.error("Google SSO error:", err);
      setErrorMessage(
        err?.errors?.[0]?.message ?? "Error conectando con Google Workspace",
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle Corporate Email + Password Submit
  const handleAuthSubmit = async () => {
    setErrorMessage(null);

    /* Lógica de PIN comentada para futura implementación:
    if (authMode === "pin") {
      const pinCode = pin.join("");
      if (pinCode.length < 4) {
        setErrorMessage("Introduce los 4 dígitos del PIN de cajero.");
        return;
      }
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        const successMsg = `PIN validado para ${stationName}. Turno de caja asignado.`;
        if (Platform.OS === "web") {
          alert(successMsg);
        } else {
          Alert.alert("Turno de Cajero", successMsg);
        }
      }, 900);
      return;
    }
    */

    if (!signIn) {
      setErrorMessage("El cliente de autenticación no está listo.");
      return;
    }

    try {
      setLoading(true);
      const { error } = await signIn.password({
        emailAddress: email.trim(),
        password,
      });

      if (error) {
        setErrorMessage(
          error.message || "Credenciales inválidas. Verifica tu correo y clave.",
        );
        return;
      }

      if (signIn.status === "complete") {
        await signIn.finalize({
          navigate: ({ decorateUrl }) => {
            const url = decorateUrl("/home");
            if (Platform.OS === "web" && url.startsWith("http")) {
              window.location.href = url;
            } else {
              router.replace(url as any);
            }
          },
        });
      } else {
        setErrorMessage(`Estado adicional requerido: ${signIn.status}`);
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setErrorMessage(err?.message || "Ocurrió un error al iniciar sesión.");
    } finally {
      setLoading(false);
    }
  };

  /* Función de cambio de estación comentada para futura implementación:
  const handleChangeStation = () => {
    if (Platform.OS === "web") {
      const val = window.prompt(
        "Introduce el número de caja o identificador POS:",
        stationName,
      );
      if (val && val.trim()) {
        setStationName(val.trim());
      }
    } else {
      Alert.prompt(
        "Cambiar Estación",
        "Introduce el identificador POS:",
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Guardar",
            onPress: (val?: string) => val && setStationName(val.trim()),
          },
        ],
        "plain-text",
        stationName,
      );
    }
  };
  */

  return (
    <SafeAreaView className="flex-1 bg-surface-base">
      <ImageBackground
        source={require("../../../assets/images/auth/login.webp")}
        resizeMode="cover"
        className="flex-1"
      >
        <View className="flex-1 bg-surface-base/85">
          <ScrollView
            contentContainerClassName="flex-grow justify-between"
            showsVerticalScrollIndicator={false}
          >
        {/* Top Header */}
        <View className="w-full px-6 py-4 flex-row items-center justify-between border-b border-surface-container-high/40">
          <View className="flex-row items-center gap-3">
            <View className="w-9 h-9 rounded-xl bg-surface-container-high items-center justify-center">
              <MaterialIcons name="point-of-sale" size={20} color="#c0c1ff" />
            </View>
            <View>
              <Text className="text-base font-bold text-on-surface tracking-tight">
                Tendo
              </Text>
              <Text className="text-xs text-on-surface-variant font-medium">
                Omnichannel OS
              </Text>
            </View>
          </View>

          <View className="flex-row items-center gap-2 bg-surface-container-low px-3 py-1.5 rounded-full border border-surface-container-high">
            <View className="w-2 h-2 rounded-full bg-primary" />
            <MaterialIcons name="lock" size={13} color="#c0c1ff" />
            <Text className="text-xs font-medium text-on-surface-variant">
              Encrypted Node
            </Text>
          </View>
        </View>

        {/* Main Content (Responsive 2 Columns on desktop, stacked on mobile) */}
        <View className="w-full max-w-7xl mx-auto px-6 py-8 flex-1 justify-center">
          <View className="flex-col lg:flex-row gap-10 items-center justify-between">
            {/* Left Column: Value Showcase & Enterprise Telemetry */}
            <View className="w-full lg:w-7/12 gap-6">
              {/* Hero Title */}
              <View className="gap-2">
                <Text className="text-3xl lg:text-4xl font-extrabold text-on-surface tracking-tight">
                  Punto de Venta Omnicanal
                </Text>
                <Text className="text-sm lg:text-base text-on-surface-variant leading-relaxed max-w-xl">
                  Plataforma unificada de alta velocidad para retail moderno,
                  cadenas de distribución y hostelería con sincronización de
                  inventario distribuida.
                </Text>
              </View>
              {/* Hardware Card */}
              <View className="bg-surface-container-low p-4 rounded-2xl border border-surface-container-high flex-row items-center gap-4">
                <Image
                  source={{
                    uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuA_dsumHIb5LnL60TL3b36FsbMCdNE97nAHAvdzVX4DYToW2DXP9kX7F_yhAaBAZ23H4I0mjDuG6S9Q_T2eA1gbtghrgDDkUHKBqNVop86pILPxQSJj1aLWw5NX1lQt3RzAx1bKPa26yd6lC5X7AH_qAqhklu_ejhhDC7MaPgT5nLyPdVySDQ-7P-ScBgHcEWJuGyMaBBqkzRSY_0MQXHO2K27pyUafk8Hsfz4hvnB9sPOQzzZ-_ft6Fw",
                  }}
                  className="w-20 h-20 rounded-xl bg-surface-container-high"
                  resizeMode="cover"
                />
                <View className="flex-1">
                  <Text className="text-xs font-bold uppercase tracking-wider text-secondary">
                    Despliegue Instantáneo
                  </Text>
                  <Text className="text-sm font-bold text-on-surface">
                    Terminales Verifone &amp; Sunmi Homologadas
                  </Text>
                  <Text className="text-xs text-on-surface-variant mt-0.5">
                    Soporte directo para impresoras térmicas ESC/POS, balanzas y
                    lectores 2D Zebra.
                  </Text>
                </View>
              </View>

              {/* Certifications Footer */}
              <View className="flex-row flex-wrap items-center gap-3 pt-1">
                <View className="flex-row items-center gap-1.5">
                  <MaterialIcons
                    name="verified-user"
                    size={16}
                    color="#c0c1ff"
                  />
                  <Text className="text-xs font-medium text-on-surface-variant">
                    PCI DSS Nivel 1
                  </Text>
                </View>
                <Text className="text-tertiary-container">•</Text>
                <View className="flex-row items-center gap-1.5">
                  <MaterialIcons name="security" size={16} color="#c0c1ff" />
                  <Text className="text-xs font-medium text-on-surface-variant">
                    Cifrado E2E AES-256
                  </Text>
                </View>
                <Text className="text-tertiary-container">•</Text>
                <View className="flex-row items-center gap-1.5">
                  <MaterialIcons name="fingerprint" size={16} color="#c0c1ff" />
                  <Text className="text-xs font-medium text-on-surface-variant">
                    Clerk Enterprise Guard
                  </Text>
                </View>
              </View>
            </View>

            {/* Right Column: Authentication Terminal Card */}
            <View className="w-full lg:w-5/12 max-w-md">
              <View className="bg-surface-container-low p-6 sm:p-8 rounded-3xl border border-surface-container-high shadow-2xl">
                {/* Card Title */}
                <View className="flex-row items-center justify-between mb-1">
                  <Text className="text-xl font-bold text-on-surface tracking-tight">
                    Bienvenido de nuevo
                  </Text>
                  <MaterialIcons name="terminal" size={24} color="#c0c1ff" />
                </View>
                <Text className="text-xs text-on-surface-variant mb-6">
                  Inicia sesión en tu terminal o espacio de trabajo.
                </Text>

                {/* Google Workspace Button */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  disabled={loading}
                  onPress={handleGoogleSignIn}
                  className="w-full h-12 bg-surface-container-high rounded-xl flex-row items-center justify-center gap-3 border border-surface-container-highest active:bg-surface-container-highest mb-4"
                >
                  <FontAwesome
                    name="google"
                    size={18}
                    color="#4285F4"
                  />
                  <Text className="text-sm font-semibold text-on-surface">
                    Continuar con Google Workspace
                  </Text>
                </TouchableOpacity>

                {/* Divider */}
                <View className="flex-row items-center justify-center my-3 relative">
                  <View className="w-full h-[1px] bg-surface-container-highest" />
                  <Text className="absolute bg-surface-container-low px-3 text-xs font-medium text-on-surface-variant lowercase">
                    o con credencial de tienda
                  </Text>
                </View>

                {/* Temporarily commented tabs:
                <View className="bg-surface-container-lowest p-1 rounded-xl flex-row mb-5 border border-surface-container-high/40">
                  <TouchableOpacity
                    onPress={() => setAuthMode("email")}
                    className={`flex-1 py-2 rounded-lg items-center ${
                      authMode === "email"
                        ? "bg-surface-container-high border border-surface-container-highest/60"
                        : ""
                    }`}
                  >
                    <Text
                      className={`text-xs font-semibold ${
                        authMode === "email"
                          ? "text-on-surface"
                          : "text-on-surface-variant"
                      }`}
                    >
                      Correo Corporativo
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setAuthMode("pin")}
                    className={`flex-1 py-2 rounded-lg items-center ${
                      authMode === "pin"
                        ? "bg-surface-container-high border border-surface-container-highest/60"
                        : ""
                    }`}
                  >
                    <Text
                      className={`text-xs font-semibold ${
                        authMode === "pin"
                          ? "text-on-surface"
                          : "text-on-surface-variant"
                      }`}
                    >
                      PIN de Cajero (Rápido)
                    </Text>
                  </TouchableOpacity>
                </View>
                */}

                {/* Error Banner */}
                {errorMessage && (
                  <View className="mb-4 p-3 rounded-xl bg-status-danger/15 border border-status-danger/30 flex-row items-center gap-2">
                    <MaterialIcons
                      name="error-outline"
                      size={16}
                      color="#EF4444"
                    />
                    <Text className="text-xs text-status-danger flex-1 font-medium">
                      {errorMessage}
                    </Text>
                  </View>
                )}

                {/* Corporate Email Form */}
                <View className="gap-4">
                  <View className="gap-1.5">
                    <View className="flex-row justify-between items-center">
                      <Text className="text-xs font-medium text-on-surface">
                        Correo electrónico
                      </Text>
                      <Text className="text-[10px] text-on-surface-variant font-mono">
                        Enter ↵
                      </Text>
                    </View>
                    <View className="flex-row items-center bg-surface-container-highest rounded-xl px-3 h-11 border border-surface-container-high">
                      <MaterialIcons name="mail" size={18} color="#c7c4d7" />
                      <TextInput
                        value={email}
                        onChangeText={setEmail}
                        placeholder="nombre@mitienda.com"
                        placeholderTextColor="#77767e"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        className="flex-1 text-sm text-on-surface ml-2.5"
                      />
                    </View>
                  </View>

                  <View className="gap-1.5">
                    <View className="flex-row justify-between items-center">
                      <Text className="text-xs font-medium text-on-surface">
                        Contraseña
                      </Text>
                      <TouchableOpacity
                        onPress={() =>
                          Alert.alert(
                            "Recuperación",
                            "Contacta a soporte o al administrador de tu sucursal.",
                          )
                        }
                      >
                        <Text className="text-xs font-medium text-primary">
                          ¿Olvidaste tu clave?
                        </Text>
                      </TouchableOpacity>
                    </View>
                    <View className="flex-row items-center bg-surface-container-highest rounded-xl px-3 h-11 border border-surface-container-high">
                      <MaterialIcons name="vpn-key" size={18} color="#c7c4d7" />
                      <TextInput
                        value={password}
                        onChangeText={setPassword}
                        placeholder="••••••••••••"
                        placeholderTextColor="#77767e"
                        secureTextEntry={!showPassword}
                        className="flex-1 text-sm text-on-surface ml-2.5"
                      />
                      <TouchableOpacity
                        onPress={() => setShowPassword(!showPassword)}
                      >
                        <MaterialIcons
                          name={showPassword ? "visibility-off" : "visibility"}
                          size={18}
                          color="#c7c4d7"
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                {/* Commented PIN form for future implementation:
                <View className="gap-4 items-center">
                  <View className="w-full flex-row items-center justify-between">
                    <Text className="text-xs font-medium text-on-surface">
                      Código de Acceso de Cajero (4 dígitos)
                    </Text>
                    <Text className="text-xs font-semibold text-secondary">
                      Turno Asignado
                    </Text>
                  </View>

                  <View className="flex-row justify-center gap-3 py-2 w-full">
                    {[0, 1, 2, 3].map((idx) => (
                      <TextInput
                        key={idx}
                        value={pin[idx]}
                        onChangeText={(val) => {
                          const newPin = [...pin];
                          newPin[idx] = val.slice(-1);
                          setPin(newPin);
                        }}
                        keyboardType="number-pad"
                        maxLength={1}
                        secureTextEntry
                        className="w-12 h-14 bg-surface-container-highest text-on-surface text-center text-xl font-bold rounded-xl border border-surface-container-high"
                      />
                    ))}
                  </View>

                  <Text className="text-xs text-on-surface-variant text-center">
                    Usa tu tarjeta de empleado o el teclado numérico rápido.
                  </Text>
                </View>
                */}

                {/* Primary Submit Button */}
                <TouchableOpacity
                  activeOpacity={0.85}
                  disabled={loading || fetchStatus === "fetching"}
                  onPress={handleAuthSubmit}
                  className="w-full h-12 bg-primary-container rounded-xl flex-row items-center justify-center gap-2 shadow-lg shadow-primary-container/30 active:scale-[0.98] mt-6"
                >
                  {loading || fetchStatus === "fetching" ? (
                    <ActivityIndicator size="small" color="#0d0096" />
                  ) : (
                    <>
                      <Text className="text-sm font-bold text-on-primary-container">
                        Continuar a Terminal
                      </Text>
                      <MaterialIcons
                        name="arrow-forward"
                        size={18}
                        color="#0d0096"
                      />
                    </>
                  )}
                </TouchableOpacity>

                {/* Commented station selector for future implementation:
                <View className="mt-5 bg-surface-container-highest/80 p-3 rounded-xl flex-row items-center justify-between border border-surface-container-high">
                  <View className="flex-row items-center gap-3 flex-1 overflow-hidden">
                    <View className="w-8 h-8 rounded-lg bg-surface-container-low items-center justify-center">
                      <MaterialIcons
                        name="receipt-long"
                        size={18}
                        color="#c0c1ff"
                      />
                    </View>
                    <View className="flex-1">
                      <Text
                        numberOfLines={1}
                        className="text-xs font-bold text-on-surface"
                      >
                        {stationName}
                      </Text>
                      <Text
                        numberOfLines={1}
                        className="text-[11px] text-on-surface-variant"
                      >
                        Turno Matutino • Terminal #882
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    onPress={handleChangeStation}
                    className="px-2.5 py-1 rounded-md bg-surface-container-low border border-surface-container-high"
                  >
                    <Text className="text-xs font-semibold text-primary">
                      Cambiar
                    </Text>
                  </TouchableOpacity>
                </View>
                */}

                {/* Bottom Notice */}
                <View className="mt-5 items-center">
                  <Text className="text-xs text-on-surface-variant text-center">
                    ¿No tienes una cuenta?{" "}
                    <Link
                      href="/register"
                      className="text-on-surface font-semibold underline"
                    >
                      Crear cuenta
                    </Link>
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Bottom Footer */}
        <View className="w-full px-6 py-4 border-t border-surface-container-high/40 flex-col sm:flex-row items-center justify-between gap-2">
          <Text className="text-xs text-on-surface-variant">
            Tendo Enterprise Terminal Network © 2025
          </Text>
          <View className="flex-row items-center gap-3">
            <Text className="text-xs text-on-surface-variant">
              Hardware Diagnostics
            </Text>
            <Text className="text-tertiary-container">•</Text>
            <Text className="text-xs text-on-surface-variant">
              Security Policy
            </Text>
          </View>
        </View>
          </ScrollView>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}
