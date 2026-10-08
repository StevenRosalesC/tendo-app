import { useClerk, useSignIn, useSSO } from "@clerk/expo";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import { useEffect, useState } from "react";
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
import AlertBanner from "../../../components/ui/AlertBanner";
import Button from "../../../components/ui/Button";
import Divider from "../../../components/ui/Divider";
import Input from "../../../components/ui/Input";
import AuthFooter from "../../../components/auth/AuthFooter";
import AuthHeader from "../../../components/auth/AuthHeader";
import AuthFeatureShowcase from "../../../components/auth/AuthFeatureShowcase";
import SocialAuthButton from "../../../components/auth/SocialAuthButton";

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

  // Device Trust / MFA state for new devices (e.g. mobile Expo Go)
  const [verificationStep, setVerificationStep] = useState<boolean>(false);
  const [verificationCode, setVerificationCode] = useState<string>("");
  const [resendCooldown, setResendCooldown] = useState<number>(0);
  const [hasSentMfaCode, setHasSentMfaCode] = useState<boolean>(false);

  // Handle countdown timer for resending MFA code
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (resendCooldown > 0) {
      timer = setTimeout(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // Automatically transition to verification mode if Clerk requires Device Trust / MFA
  useEffect(() => {
    if (
      signIn?.status === "needs_client_trust" ||
      signIn?.status === "needs_second_factor"
    ) {
      setVerificationStep(true);
      if (!hasSentMfaCode) {
        setHasSentMfaCode(true);
        const emailCodeFactor = signIn.supportedSecondFactors?.find(
          (factor) => factor.strategy === "email_code",
        );
        if (emailCodeFactor) {
          signIn.mfa.sendEmailCode().catch((err) => {
            console.error("Auto-send MFA email code error:", err);
          });
        }
      }
    }
  }, [signIn?.status, hasSentMfaCode]);

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

    /* Commented PIN logic for future implementation:
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
      } else if (
        signIn.status === "needs_client_trust" ||
        signIn.status === "needs_second_factor"
      ) {
        setVerificationStep(true);
        setErrorMessage(null);
        setHasSentMfaCode(true);

        const emailCodeFactor = signIn.supportedSecondFactors?.find(
          (factor) => factor.strategy === "email_code",
        );
        if (emailCodeFactor) {
          const { error: sendErr } = await signIn.mfa.sendEmailCode();
          if (sendErr) {
            setErrorMessage(
              sendErr.message ||
                "Error al enviar el código de verificación al correo.",
            );
          }
        } else {
          const phoneCodeFactor = signIn.supportedSecondFactors?.find(
            (factor) => factor.strategy === "phone_code",
          );
          if (phoneCodeFactor) {
            const { error: sendErr } = await signIn.mfa.sendPhoneCode();
            if (sendErr) {
              setErrorMessage(
                sendErr.message ||
                  "Error al enviar el código de verificación al teléfono.",
              );
            }
          }
        }
        setResendCooldown(30);
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

  // Verify MFA / Device Trust code
  const handleVerifyMfa = async () => {
    if (!verificationCode.trim()) {
      setErrorMessage("Por favor ingresa el código de 6 dígitos.");
      return;
    }

    if (!signIn) {
      setErrorMessage("El cliente de autenticación no está listo.");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage(null);

      const emailFactor = signIn.supportedSecondFactors?.find(
        (factor) => factor.strategy === "email_code",
      );

      let verifyResult;
      if (emailFactor) {
        verifyResult = await signIn.mfa.verifyEmailCode({
          code: verificationCode.trim(),
        });
      } else {
        verifyResult = await signIn.mfa.verifyPhoneCode({
          code: verificationCode.trim(),
        });
      }

      if (verifyResult?.error) {
        setErrorMessage(
          verifyResult.error.message ||
            "Código de verificación inválido o expirado.",
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
      console.error("Device trust verification error:", err);
      setErrorMessage(
        err?.message || "Ocurrió un error al verificar el dispositivo.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Resend MFA / Device Trust code
  const handleResendMfaCode = async () => {
    if (!signIn || resendCooldown > 0) return;
    try {
      setLoading(true);
      setErrorMessage(null);

      const emailFactor = signIn.supportedSecondFactors?.find(
        (factor) => factor.strategy === "email_code",
      );
      if (emailFactor) {
        const { error } = await signIn.mfa.sendEmailCode();
        if (error) {
          setErrorMessage(error.message || "No se pudo reenviar el código.");
          return;
        }
      } else {
        const { error } = await signIn.mfa.sendPhoneCode();
        if (error) {
          setErrorMessage(error.message || "No se pudo reenviar el código.");
          return;
        }
      }
      setResendCooldown(30);
    } catch (err: any) {
      setErrorMessage(err?.message || "No se pudo reenviar el código.");
    } finally {
      setLoading(false);
    }
  };

  // Cancel MFA verification and reset sign-in state
  const handleCancelMfa = async () => {
    try {
      setLoading(true);
      await signIn?.reset();
    } catch (e) {
      console.error("Reset sign-in error:", e);
    } finally {
      setVerificationStep(false);
      setHasSentMfaCode(false);
      setVerificationCode("");
      setErrorMessage(null);
      setLoading(false);
    }
  };

  /* Commented change station function for future implementation:
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
        <AuthHeader
          badgeLabel="Encrypted Node"
          badgeDotColor="bg-primary"
          badgeIcon="lock"
        />

        {/* Main Content (Responsive 2 Columns on desktop, stacked on mobile) */}
        <View className="w-full max-w-7xl mx-auto px-6 py-8 flex-1 justify-center">
          <View className="flex-col lg:flex-row gap-10 items-center justify-between">
            {/* Left Column: Value Showcase & Enterprise Telemetry */}
            <AuthFeatureShowcase
              certifications={[
                { icon: "verified-user", label: "PCI DSS Nivel 1" },
                { icon: "security", label: "Cifrado E2E AES-256" },
                { icon: "fingerprint", label: "Autenticación Segura" },
              ]}
            />

            {/* Right Column: Authentication Terminal Card */}
            <View className="w-full lg:w-5/12 max-w-md">
              <View className="bg-surface-container-low p-6 sm:p-8 rounded-3xl border border-surface-container-high shadow-2xl">
                {verificationStep ? (
                  /* Device Trust / MFA Verification Flow for New Devices */
                  <View>
                    <View className="items-center pb-4 mb-3 border-b border-surface-container-high/40">
                      <View className="w-12 h-12 rounded-2xl bg-secondary-container/30 border border-secondary/40 items-center justify-center mb-2.5">
                        <MaterialIcons name="devices" size={24} color="#c0c1ff" />
                      </View>
                      <Text className="text-xl font-bold text-on-surface text-center tracking-tight">
                        Dispositivo No Reconocido
                      </Text>
                      <Text className="text-xs text-on-surface-variant text-center mt-1 leading-relaxed max-w-xs">
                        Por seguridad (Device Trust), ingresa el código de seguridad de 6 dígitos que enviamos para autorizar este acceso.
                      </Text>
                      <View className="mt-3 px-3 py-1.5 rounded-lg bg-surface-container-high border border-surface-container-highest flex-row items-center gap-2">
                        <MaterialIcons name="mail-outline" size={14} color="#c0c1ff" />
                        <Text className="text-xs font-semibold text-on-surface">
                          {email || signIn?.identifier || "tu correo registrado"}
                        </Text>
                      </View>
                    </View>

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

                    {/* Verification Code Input */}
                    <View className="gap-1.5 mb-5">
                      <View className="flex-row justify-between items-center">
                        <Text className="text-xs font-medium text-on-surface">
                          Código de Autorización (6 dígitos)
                        </Text>
                        {resendCooldown > 0 ? (
                          <Text className="text-xs text-on-surface-variant">
                            Reenviar en {resendCooldown}s
                          </Text>
                        ) : (
                          <TouchableOpacity onPress={handleResendMfaCode}>
                            <Text className="text-xs font-semibold text-primary">
                              Reenviar código
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                      <View className="flex-row items-center bg-surface-container-highest rounded-xl px-3 h-12 border border-surface-container-high">
                        <MaterialIcons name="dialpad" size={20} color="#c7c4d7" />
                        <TextInput
                          value={verificationCode}
                          onChangeText={setVerificationCode}
                          placeholder="123456"
                          placeholderTextColor="#77767e"
                          keyboardType="number-pad"
                          maxLength={6}
                          className="flex-1 text-base font-mono tracking-widest text-on-surface ml-2.5 text-center"
                        />
                      </View>
                    </View>

                    {/* Submit Verification Button */}
                    <TouchableOpacity
                      activeOpacity={0.85}
                      disabled={loading || fetchStatus === "fetching"}
                      onPress={handleVerifyMfa}
                      className="w-full h-12 bg-primary-container rounded-xl flex-row items-center justify-center gap-2"
                    >
                      {loading || fetchStatus === "fetching" ? (
                        <ActivityIndicator size="small" color="#0d0096" />
                      ) : (
                        <>
                          <Text className="text-sm font-bold text-on-primary-container">
                            Autorizar y Continuar a Terminal
                          </Text>
                          <MaterialIcons
                            name="arrow-forward"
                            size={18}
                            color="#0d0096"
                          />
                        </>
                      )}
                    </TouchableOpacity>

                    {/* Cancel & start over button */}
                    <TouchableOpacity
                      onPress={handleCancelMfa}
                      className="mt-4 py-2 items-center"
                    >
                      <Text className="text-xs text-on-surface-variant font-medium">
                        ← Usar otra cuenta o volver
                      </Text>
                    </TouchableOpacity>

                    <View nativeID="clerk-captcha" />
                  </View>
                ) : (
                  /* Standard Login View */
                  <View>
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
                    <SocialAuthButton
                      onPress={handleGoogleSignIn}
                      loading={loading}
                    />

                    {/* Divider */}
                    <Divider
                      label="o con credencial de tienda"
                      className="my-3"
                    />

                    {/* Error Banner */}
                    <AlertBanner message={errorMessage} className="mb-4" />

                    {/* Corporate Email Form */}
                    <View className="gap-4">
                      <Input
                        label="Correo electrónico"
                        rightLabel={
                          <Text className="text-[10px] text-on-surface-variant font-mono">
                            Enter ↵
                          </Text>
                        }
                        iconName="mail"
                        value={email}
                        onChangeText={setEmail}
                        placeholder="nombre@mitienda.com"
                        keyboardType="email-address"
                        autoCapitalize="none"
                      />

                      <Input
                        label="Contraseña"
                        rightLabel={
                          <Link href="/forgot-password" asChild>
                            <TouchableOpacity>
                              <Text className="text-xs font-medium text-primary">
                                ¿Olvidaste tu clave?
                              </Text>
                            </TouchableOpacity>
                          </Link>
                        }
                        iconName="vpn-key"
                        value={password}
                        onChangeText={setPassword}
                        placeholder="••••••••••••"
                        isPassword
                      />
                    </View>

                    {/* Primary Submit Button */}
                    <Button
                      label="Continuar a Terminal"
                      rightIcon={
                        <MaterialIcons
                          name="arrow-forward"
                          size={18}
                          color="#0d0096"
                        />
                      }
                      fullWidth
                      loading={loading || fetchStatus === "fetching"}
                      onPress={handleAuthSubmit}
                      className="mt-6"
                    />

                    <View nativeID="clerk-captcha" />
                  </View>
                )}

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
        <AuthFooter />
          </ScrollView>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}
