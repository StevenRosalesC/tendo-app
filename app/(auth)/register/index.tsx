import { useClerk, useSignUp, useSSO } from "@clerk/expo";
import { MaterialIcons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
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
import SocialAuthButton from "../../../components/auth/SocialAuthButton";
import tendoApi from "../../../services/api";
import useAuthStore from "../../../stores/useAuthStore";
import { useKeyboard } from "../../../hooks/useKeyboard";

export default function RegisterScreen() {
  const router = useRouter();
  const { signUp, errors, fetchStatus } = useSignUp();
  const { startSSOFlow } = useSSO();
  const clerk = useClerk();
  const { setUser } = useAuthStore();
  const { isKeyboardVisible, keyboardHeight } = useKeyboard();

  // Local state
  const [name, setName] = useState<string>("");
  const [storeName, setStoreName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [verificationCode, setVerificationCode] = useState<string>("");
  const [pendingVerification, setPendingVerification] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState<boolean>(false);

  // Helper to provision B2B Organization & JIT backend user
  const handleProvisioningAndNavigate = async () => {
    try {
      setLoading(true);
      setLoadingStep("Activando sesión de operador...");

      if (signUp?.createdSessionId) {
        await clerk.setActive({ session: signUp.createdSessionId });
      }

      setLoadingStep("Configurando tienda y organización B2B...");

      const organizationName = storeName.trim() || `${name.trim()}'s Store`;
      try {
        const org = await clerk.createOrganization({ name: organizationName });
        await clerk.setActive({ organization: org.id });
      } catch (orgErr: any) {
        console.warn("Organization creation note:", orgErr?.message || orgErr);
      }

      setLoadingStep("Sincronizando con base de datos Tendo JIT...");

      const token = await clerk.session?.getToken();
      if (token) {
        try {
          const profile = await tendoApi.getProfile(token);
          setUser(profile);
        } catch (apiErr: any) {
          console.warn("Backend JIT profile fetch note:", apiErr?.message || apiErr);
        }
      }

      router.replace("/home");
    } catch (err: any) {
      console.error("Provisioning error:", err);
      setErrorMessage(
        err?.message || "Error en el aprovisionamiento de la tienda.",
      );
    } finally {
      setLoading(false);
      setLoadingStep("");
    }
  };

  // Handle Google SSO / Workspace
  const handleGoogleSignUp = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      const result = await startSSOFlow({ strategy: "oauth_google" });
      if (result.createdSessionId) {
        await result.setActive?.({ session: result.createdSessionId });

        if (!clerk.organization) {
          const organizationName = storeName.trim() || "Tienda Principal";
          try {
            const org = await clerk.createOrganization({ name: organizationName });
            await clerk.setActive({ organization: org.id });
          } catch (orgErr: any) {
            console.warn("SSO Org creation note:", orgErr?.message || orgErr);
          }
        }

        const token = await clerk.session?.getToken();
        if (token) {
          try {
            const profile = await tendoApi.getProfile(token);
            setUser(profile);
          } catch (apiErr: any) {
            console.warn("Backend JIT profile fetch note:", apiErr?.message || apiErr);
          }
        }

        router.replace("/home");
      }
    } catch (err: any) {
      console.error("Google SSO SignUp error:", err);
      setErrorMessage(
        err?.errors?.[0]?.message ?? "Error conectando con Google Workspace",
      );
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Submit Registration
  const handleRegisterSubmit = async () => {
    if (!name.trim()) {
      setErrorMessage("Por favor ingresa tu nombre completo o de operador.");
      return;
    }
    if (!storeName.trim()) {
      setErrorMessage("Por favor ingresa el nombre de tu tienda o negocio.");
      return;
    }
    if (!email.trim()) {
      setErrorMessage("Por favor ingresa un correo corporativo válido.");
      return;
    }
    if (password.length < 8) {
      setErrorMessage("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (!signUp) {
      setErrorMessage("El cliente de autenticación no está listo.");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage(null);

      const nameParts = name.trim().split(" ");
      const firstName = nameParts[0] || "Operador";
      const lastName = nameParts.slice(1).join(" ") || undefined;

      const { error } = await signUp.password({
        emailAddress: email.trim(),
        password,
        firstName,
        lastName,
      });

      if (error) {
        setErrorMessage(
          error.message || "Error al registrar la cuenta. Verifica los datos.",
        );
        return;
      }

      // Check if email verification code is needed
      if (
        signUp.status === "missing_requirements" &&
        signUp.unverifiedFields.includes("email_address")
      ) {
        await signUp.verifications.sendEmailCode();
        setPendingVerification(true);
      } else if (signUp.status === "complete") {
        await handleProvisioningAndNavigate();
      }
    } catch (err: any) {
      console.error("SignUp error:", err);
      setErrorMessage(err?.message || "Ocurrió un error al crear la cuenta.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify Email Code
  const handleVerifyCode = async () => {
    if (!verificationCode.trim()) {
      setErrorMessage("Introduce el código de verificación de 6 dígitos.");
      return;
    }

    if (!signUp) {
      setErrorMessage("El cliente de autenticación no está listo.");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage(null);

      const { error } = await signUp.verifications.verifyEmailCode({
        code: verificationCode.trim(),
      });

      if (error) {
        setErrorMessage(
          error.message || "Código incorrecto o expirado. Intenta de nuevo.",
        );
        return;
      }

      if (signUp.status === "complete") {
        await handleProvisioningAndNavigate();
      } else {
        setErrorMessage(`Estado adicional requerido: ${signUp.status}`);
      }
    } catch (err: any) {
      console.error("Verification error:", err);
      setErrorMessage(
        err?.message || "Ocurrió un error al verificar el código.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Resend Verification Code
  const handleResendCode = async () => {
    if (!signUp || resendCooldown) return;
    try {
      setResendCooldown(true);
      await signUp.verifications.sendEmailCode();
      setErrorMessage(null);
      setTimeout(() => setResendCooldown(false), 30000);
    } catch (err: any) {
      setErrorMessage(err?.message || "No se pudo reenviar el código.");
      setResendCooldown(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-surface-base">
      <ImageBackground
        source={require("../../../assets/images/auth/login.webp")}
        resizeMode="cover"
        className="flex-1"
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          className="flex-1"
        >
          <View className="flex-1 bg-surface-base/85">
            <ScrollView
              contentContainerStyle={{
                flexGrow: 1,
                justifyContent: "space-between",
                paddingBottom: Platform.OS === "ios" ? 40 : (isKeyboardVisible ? keyboardHeight + 60 : 40),
              }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
            >
              {/* Top Header */}
              <AuthHeader />

              {/* Main Content (Responsive 2 Columns on desktop, stacked on mobile) */}
              <View className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 justify-center items-center lg:items-stretch">
                <View className="flex-col lg:flex-row gap-10 items-center justify-between">
                  {/* Left Column: Enterprise Onboarding & Value Showcase */}
                  <View className="hidden lg:flex w-full lg:w-7/12 gap-6">
                  {/* Status Pill */}
                  <View className="flex-row items-center gap-2 bg-surface-container-high px-4 py-1.5 rounded-full self-start border border-surface-container-highest/60">
                    <View className="w-2 h-2 rounded-full bg-primary" />
                    <Text className="text-xs font-semibold text-on-surface-variant">
                      Registro de Operador • Tendo Cloud •{" "}
                      <Text className="text-secondary font-bold">TLS 1.3</Text>
                    </Text>
                  </View>

                  {/* Hero Title */}
                  <View className="gap-2">
                    <Text className="text-3xl lg:text-4xl font-extrabold text-on-surface tracking-tight">
                      Alta de Terminal y Operador
                    </Text>
                    <Text className="text-sm lg:text-base text-on-surface-variant leading-relaxed max-w-xl">
                      Habilita nuevos puestos de caja, puntos de venta móviles y
                      credenciales seguras para tu equipo de tienda en segundos.
                    </Text>
                  </View>

                  {/* Bento Metric Cards */}
                  <View className="flex-col sm:flex-row gap-4">
                    {/* Bento Card 1: Fast Provisioning */}
                    <View className="flex-1 bg-surface-container-low p-5 rounded-2xl border border-surface-container-high justify-between">
                      <View className="flex-row items-center justify-between mb-3">
                        <View className="w-10 h-10 rounded-xl bg-surface-container-highest items-center justify-center">
                          <MaterialIcons
                            name="speed"
                            size={22}
                            color="#c0c1ff"
                          />
                        </View>
                        <View className="bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
                          <Text className="text-xs font-bold text-primary">
                            &lt; 2 min
                          </Text>
                        </View>
                      </View>

                      <Text className="text-sm font-bold text-on-surface">
                        Despliegue Inmediato
                      </Text>
                      <Text className="text-xs text-on-surface-variant mt-1 leading-snug">
                        Sincronización instantánea de inventario, tarifas y
                        catálogo comercial.
                      </Text>
                    </View>

                    {/* Bento Card 2: Security & Permissions */}
                    <View className="flex-1 bg-surface-container-low p-5 rounded-2xl border border-surface-container-high justify-between">
                      <View className="flex-row items-center justify-between mb-3">
                        <View className="w-10 h-10 rounded-xl bg-surface-container-highest items-center justify-center">
                          <MaterialIcons
                            name="badge"
                            size={22}
                            color="#c3c0ff"
                          />
                        </View>
                        <View className="bg-surface-container-highest px-2.5 py-1 rounded-full border border-surface-container-high">
                          <Text className="text-xs font-bold text-on-surface">
                            RBAC Activo
                          </Text>
                        </View>
                      </View>

                      <Text className="text-sm font-bold text-on-surface">
                        Roles y Auditoría
                      </Text>
                      <Text className="text-xs text-on-surface-variant mt-1 leading-snug">
                        Control granular para cajeros, supervisores y gerentes de
                        turno con registro continuo.
                      </Text>
                    </View>
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
                        Ecosistema Tendo
                      </Text>
                      <Text className="text-sm font-bold text-on-surface">
                        Integración Nube &amp; Hardware POS
                      </Text>
                      <Text className="text-xs text-on-surface-variant mt-0.5">
                        Compatibilidad nativa con terminales Sunmi, impresoras de
                        tickets y lectores de código de barras.
                      </Text>
                    </View>
                  </View>

                  {/* Security Certifications */}
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
                      <MaterialIcons
                        name="security"
                        size={16}
                        color="#c0c1ff"
                      />
                      <Text className="text-xs font-medium text-on-surface-variant">
                        Cifrado E2E AES-256
                      </Text>
                    </View>
                    <Text className="text-tertiary-container">•</Text>
                    <View className="flex-row items-center gap-1.5">
                      <MaterialIcons
                        name="fingerprint"
                        size={16}
                        color="#c0c1ff"
                      />
                      <Text className="text-xs font-medium text-on-surface-variant">
                        Autenticación Segura
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Right Column: Registration Card */}
                <View className="w-full lg:w-5/12 max-w-md">
                  <View className="bg-surface-container-low p-6 sm:p-8 rounded-3xl border border-surface-container-high shadow-2xl">
                    {/* Bot Protection Mount Point Required by Clerk */}
                    <View nativeID="clerk-captcha" />

                    {/* Card Header */}
                    <View className="flex-row items-center justify-between mb-1">
                      <Text className="text-xl font-bold text-on-surface tracking-tight">
                        {pendingVerification
                          ? "Verifica tu correo"
                          : "Crear Cuenta de Operador"}
                      </Text>
                      <MaterialIcons
                        name={pendingVerification ? "mark-email-read" : "person-add"}
                        size={24}
                        color="#c0c1ff"
                      />
                    </View>
                    <Text className="text-xs text-on-surface-variant mb-6">
                      {pendingVerification
                        ? `Hemos enviado un código a ${email}`
                        : "Registra tus credenciales de tienda para comenzar."}
                    </Text>

                    {/* Google Workspace Button (Only in Step 1) */}
                    {!pendingVerification && (
                      <>
                        <SocialAuthButton
                          onPress={handleGoogleSignUp}
                          loading={loading}
                          label="Registrarse con Google Workspace"
                        />

                        {/* Divider */}
                        <Divider
                          label="o con correo corporativo"
                          className="my-3"
                        />
                      </>
                    )}

                    {/* Error Banner */}
                    <AlertBanner message={errorMessage} className="mb-4" />

                    {/* Step 1: Registration Form */}
                    {!pendingVerification ? (
                      <View className="gap-4">
                        {/* Name Input */}
                        <Input
                          label="Nombre del operador"
                          iconName="person"
                          value={name}
                          onChangeText={setName}
                          placeholder="Ej. Roberto Morales"
                          autoCapitalize="words"
                        />

                        {/* Store / Business Name Input */}
                        <Input
                          label="Nombre de la Tienda / Negocio"
                          iconName="store"
                          value={storeName}
                          onChangeText={setStoreName}
                          placeholder="Ej. Supermercado Condesa"
                          autoCapitalize="words"
                        />

                        {/* Email Input */}
                        <Input
                          label="Correo corporativo"
                          iconName="mail"
                          value={email}
                          onChangeText={setEmail}
                          placeholder="operador@mitienda.com"
                          keyboardType="email-address"
                          autoCapitalize="none"
                        />

                        {/* Password Input */}
                        <Input
                          label="Contraseña (mínimo 8 caracteres)"
                          iconName="vpn-key"
                          value={password}
                          onChangeText={setPassword}
                          placeholder="••••••••••••"
                          isPassword
                        />

                        {/* Submit Button */}
                        <Button
                          label={loadingStep || "Crear Cuenta y Tienda"}
                          rightIcon={
                            <MaterialIcons
                              name="arrow-forward"
                              size={18}
                              color="#0d0096"
                            />
                          }
                          fullWidth
                          loading={loading || fetchStatus === "fetching"}
                          onPress={handleRegisterSubmit}
                          className="mt-2"
                        />
                      </View>
                    ) : (
                      /* Step 2: Email Verification Code */
                      <View className="gap-4">
                        <Input
                          label="Código de verificación (6 dígitos)"
                          iconName="pin"
                          value={verificationCode}
                          onChangeText={setVerificationCode}
                          placeholder="123456"
                          keyboardType="number-pad"
                          maxLength={6}
                          inputClassName="text-lg font-bold tracking-widest text-center"
                        />

                        {/* Submit Verification Code */}
                        <Button
                          label={loadingStep || "Verificar y Activar Terminal"}
                          rightIcon={
                            <MaterialIcons
                              name="check-circle"
                              size={18}
                              color="#0d0096"
                            />
                          }
                          fullWidth
                          loading={loading || fetchStatus === "fetching"}
                          onPress={handleVerifyCode}
                          className="mt-2"
                        />

                        {/* Resend Code Button */}
                        <TouchableOpacity
                          disabled={!!resendCooldown}
                          onPress={handleResendCode}
                          className="py-2 items-center"
                        >
                          <Text
                            className={`text-xs font-semibold ${
                              resendCooldown
                                ? "text-on-surface-variant/50"
                                : "text-primary"
                            }`}
                          >
                            {resendCooldown
                              ? "Espera 30s para reenviar"
                              : "¿No recibiste el código? Reenviar"}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}

                    {/* Bottom Notice: Link to Login */}
                    <View className="mt-6 items-center">
                      <Text className="text-xs text-on-surface-variant text-center">
                        ¿Ya tienes una cuenta de operador?{" "}
                        <Link
                          href="/login"
                          className="text-on-surface font-semibold underline"
                        >
                          Inicia sesión aquí
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
      </KeyboardAvoidingView>
    </ImageBackground>
    </SafeAreaView>
  );
}
