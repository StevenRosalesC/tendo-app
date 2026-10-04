import { useSignIn } from "@clerk/expo";
import { MaterialIcons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ImageBackground,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AuthFooter from "@/components/auth/AuthFooter";
import AuthHeader from "@/components/auth/AuthHeader";
import AlertBanner from "@/components/ui/AlertBanner";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { signIn, errors, fetchStatus } = useSignIn();

  // Screen flow state: "request" (email) | "verify" (code & new password)
  const [step, setStep] = useState<"request" | "verify">("request");

  // Form fields
  const [email, setEmail] = useState<string>("");
  const [verificationCode, setVerificationCode] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  // UI state
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState<number>(0);

  // Handle countdown timer for resending code
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (resendCooldown > 0) {
      timer = setTimeout(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // Step 1: Send Password Reset Code
  const handleSendCode = async () => {
    if (!email.trim()) {
      setErrorMessage("Por favor ingresa tu correo electrónico corporativo.");
      return;
    }

    if (!signIn) {
      setErrorMessage("El cliente de autenticación no está listo.");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage(null);

      // Initialize sign-in with user identifier
      const { error: createError } = await signIn.create({
        identifier: email.trim(),
      });

      if (createError) {
        setErrorMessage(
          createError.message ||
            "No se encontró una cuenta asociada a este correo.",
        );
        return;
      }

      // Request email verification code for password reset
      const { error: sendError } =
        await signIn.resetPasswordEmailCode.sendCode();

      if (sendError) {
        setErrorMessage(
          sendError.message || "Error al enviar el código de restablecimiento.",
        );
        return;
      }

      setStep("verify");
      setResendCooldown(30);
    } catch (err: any) {
      console.error("Forgot password send code error:", err);
      setErrorMessage(
        err?.message || "Ocurrió un error al procesar tu solicitud.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify Code and Set New Password
  const handleResetPassword = async () => {
    if (!verificationCode.trim()) {
      setErrorMessage("Por favor ingresa el código de verificación de 6 dígitos.");
      return;
    }

    if (newPassword.length < 8) {
      setErrorMessage("La nueva contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Las contraseñas no coinciden. Verifica e intenta nuevamente.");
      return;
    }

    if (!signIn) {
      setErrorMessage("El cliente de autenticación no está listo.");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage(null);

      // Verify the OTP code
      const { error: verifyError } =
        await signIn.resetPasswordEmailCode.verifyCode({
          code: verificationCode.trim(),
        });

      if (verifyError) {
        setErrorMessage(
          verifyError.message ||
            "Código incorrecto o expirado. Verifica el código e inténtalo de nuevo.",
        );
        return;
      }

      // Submit the new password
      const { error: submitError } =
        await signIn.resetPasswordEmailCode.submitPassword({
          password: newPassword,
          signOutOfOtherSessions: true,
        });

      if (submitError) {
        setErrorMessage(
          submitError.message || "Error al actualizar la contraseña.",
        );
        return;
      }

      if (signIn.status === "complete") {
        setSuccessMessage("¡Contraseña restablecida con éxito! Redirigiendo...");
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
      console.error("Forgot password reset error:", err);
      setErrorMessage(
        err?.message || "Ocurrió un error al restablecer la contraseña.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Resend code handler
  const handleResendCode = async () => {
    if (!signIn || resendCooldown > 0) return;

    try {
      setLoading(true);
      setErrorMessage(null);

      const { error } = await signIn.resetPasswordEmailCode.sendCode();

      if (error) {
        setErrorMessage(error.message || "No se pudo reenviar el código.");
        return;
      }

      setResendCooldown(30);
    } catch (err: any) {
      setErrorMessage(err?.message || "No se pudo reenviar el código.");
    } finally {
      setLoading(false);
    }
  };

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
            {/* Top Navigation / Brand Header */}
            <AuthHeader
              badgeLabel="Recovery Node"
              badgeDotColor="bg-status-success"
              badgeIcon="security"
            />

            {/* Main Content Area */}
            <View className="w-full max-w-7xl mx-auto px-6 py-8 flex-1 justify-center">
              <View className="flex-col lg:flex-row gap-10 items-center justify-between">
                {/* Left Column: Security Protocols & Enterprise Information */}
                <View className="w-full lg:w-7/12 gap-6">
                  <View className="gap-2">
                    <View className="flex-row items-center gap-2 mb-1">
                      <View className="px-2.5 py-1 rounded bg-secondary-container/40 border border-secondary/30">
                        <Text className="text-[11px] font-semibold text-secondary uppercase tracking-wider">
                          Seguridad & Acceso
                        </Text>
                      </View>
                    </View>
                    <Text className="text-3xl lg:text-4xl font-extrabold text-on-surface tracking-tight">
                      Recuperación de Contraseña
                    </Text>
                    <Text className="text-sm lg:text-base text-on-surface-variant leading-relaxed max-w-xl">
                      Protocolo seguro para restablecer credenciales de operador
                      y terminales autorizadas en el sistema Tendo POS.
                    </Text>
                  </View>

                  {/* Security Highlights */}
                  <View className="gap-3.5 max-w-xl">
                    <View className="flex-row items-start gap-3.5 bg-surface-container-low/70 border border-surface-container-high/50 p-4 rounded-xl">
                      <View className="w-9 h-9 rounded-lg bg-surface-container-high items-center justify-center mt-0.5">
                        <MaterialIcons name="verified-user" size={18} color="#c0c1ff" />
                      </View>
                      <View className="flex-1">
                        <Text className="text-sm font-semibold text-on-surface">
                          Protocolo Criptográfico Zero-Trust
                        </Text>
                        <Text className="text-xs text-on-surface-variant leading-relaxed mt-0.5">
                          El código de 6 dígitos caduca automáticamente tras 15
                          minutos y requiere verificación de factor único.
                        </Text>
                      </View>
                    </View>

                    <View className="flex-row items-start gap-3.5 bg-surface-container-low/70 border border-surface-container-high/50 p-4 rounded-xl">
                      <View className="w-9 h-9 rounded-lg bg-surface-container-high items-center justify-center mt-0.5">
                        <MaterialIcons name="security-update-good" size={18} color="#10B981" />
                      </View>
                      <View className="flex-1">
                        <Text className="text-sm font-semibold text-on-surface">
                          Cierre Preventivo de Sesiones
                        </Text>
                        <Text className="text-xs text-on-surface-variant leading-relaxed mt-0.5">
                          Al actualizar tu contraseña, se cerrarán automáticamente
                          todas las sesiones activas en cajas y dispositivos remotos.
                        </Text>
                      </View>
                    </View>

                    <View className="flex-row items-start gap-3.5 bg-surface-container-low/70 border border-surface-container-high/50 p-4 rounded-xl">
                      <View className="w-9 h-9 rounded-lg bg-surface-container-high items-center justify-center mt-0.5">
                        <MaterialIcons name="support-agent" size={18} color="#c3c0ff" />
                      </View>
                      <View className="flex-1">
                        <Text className="text-sm font-semibold text-on-surface">
                          ¿Bloqueo total durante turno?
                        </Text>
                        <Text className="text-xs text-on-surface-variant leading-relaxed mt-0.5">
                          Solicita autorización manual con el Administrador o
                          Supervisor de Sucursal para acceso de emergencia.
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Right Column: Reset Form Card */}
                <View className="w-full lg:w-5/12 max-w-md">
                  <View className="bg-surface-container-low/95 border border-surface-container-high/60 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
                    {/* Step indicator header */}
                    <View className="flex-row items-center justify-between pb-5 border-b border-surface-container-high/50">
                      <View className="flex-row items-center gap-2">
                        <View className="w-8 h-8 rounded-lg bg-primary-container/20 border border-primary/30 items-center justify-center">
                          <MaterialIcons
                            name={step === "request" ? "mark-email-read" : "lock-reset"}
                            size={18}
                            color="#c0c1ff"
                          />
                        </View>
                        <View>
                          <Text className="text-base font-bold text-on-surface">
                            {step === "request"
                              ? "Restablecer Acceso"
                              : "Nueva Contraseña"}
                          </Text>
                          <Text className="text-xs text-on-surface-variant">
                            {step === "request"
                              ? "Paso 1 de 2: Identificación"
                              : "Paso 2 de 2: Verificación"}
                          </Text>
                        </View>
                      </View>

                      {step === "verify" && (
                        <TouchableOpacity
                          onPress={() => {
                            setStep("request");
                            setErrorMessage(null);
                          }}
                          className="px-2.5 py-1 rounded bg-surface-container-high border border-surface-container-highest"
                        >
                          <Text className="text-xs text-primary font-medium">
                            Cambiar correo
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>

                    {/* Feedback Messages */}
                    {errorMessage && (
                      <AlertBanner
                        message={errorMessage}
                        type="error"
                        className="mt-4"
                      />
                    )}

                    {successMessage && (
                      <AlertBanner
                        message={successMessage}
                        type="success"
                        className="mt-4"
                      />
                    )}

                    {/* Step 1: Request Code Form */}
                    {step === "request" && (
                      <View className="gap-5 mt-5">
                        <Text className="text-xs text-on-surface-variant leading-relaxed">
                          Introduce el correo electrónico corporativo registrado.
                          Te enviaremos un código de seguridad para verificar tu identidad.
                        </Text>

                        <Input
                          label="Correo Corporativo"
                          iconName="mail-outline"
                          value={email}
                          onChangeText={setEmail}
                          placeholder="operador@tendo.app"
                          keyboardType="email-address"
                          autoCapitalize="none"
                        />

                        {/* Submit Button */}
                        <Button
                          label="Enviar Código de Recuperación"
                          onPress={handleSendCode}
                          loading={loading}
                          rightIcon={
                            <MaterialIcons
                              name="arrow-forward"
                              size={16}
                              color="#0d0096"
                            />
                          }
                          className="mt-2"
                        />
                      </View>
                    )}

                    {/* Step 2: Verification Code & New Password */}
                    {step === "verify" && (
                      <View className="gap-4 mt-5">
                        {/* Target email badge */}
                        <View className="bg-surface-container-high/60 border border-surface-container-high px-3 py-2 rounded-xl flex-row items-center gap-2">
                          <MaterialIcons name="mark-email-read" size={16} color="#c0c1ff" />
                          <Text className="text-xs text-on-surface-variant flex-1 truncate">
                            Código enviado a:{" "}
                            <Text className="text-on-surface font-semibold">
                              {email}
                            </Text>
                          </Text>
                        </View>

                        {/* OTP Verification Code */}
                        <Input
                          label="Código de Seguridad (6 dígitos)"
                          rightLabel={
                            resendCooldown > 0 ? (
                              <Text className="text-xs text-on-surface-variant">
                                Reenviar en {resendCooldown}s
                              </Text>
                            ) : (
                              <TouchableOpacity onPress={handleResendCode}>
                                <Text className="text-xs font-semibold text-primary">
                                  Reenviar código
                                </Text>
                              </TouchableOpacity>
                            )
                          }
                          iconName="dialpad"
                          value={verificationCode}
                          onChangeText={setVerificationCode}
                          placeholder="123456"
                          keyboardType="number-pad"
                          maxLength={6}
                          inputClassName="font-mono tracking-widest"
                        />

                        {/* New Password */}
                        <Input
                          label="Nueva Contraseña"
                          iconName="vpn-key"
                          value={newPassword}
                          onChangeText={setNewPassword}
                          placeholder="Mínimo 8 caracteres"
                          isPassword
                        />

                        {/* Confirm New Password */}
                        <Input
                          label="Confirmar Nueva Contraseña"
                          iconName="lock-outline"
                          value={confirmPassword}
                          onChangeText={setConfirmPassword}
                          placeholder="Repite la contraseña"
                          isPassword
                        />

                        {/* Password rules badge */}
                        <View className="flex-row items-center gap-2 pt-1">
                          <MaterialIcons
                            name={newPassword.length >= 8 ? "check-circle" : "radio-button-unchecked"}
                            size={14}
                            color={newPassword.length >= 8 ? "#10B981" : "#77767e"}
                          />
                          <Text
                            className={`text-xs ${
                              newPassword.length >= 8
                                ? "text-status-success font-medium"
                                : "text-on-surface-variant"
                            }`}
                          >
                            Mínimo 8 caracteres requeridos
                          </Text>
                        </View>

                        {/* Submit Button */}
                        <Button
                          label="Confirmar y Acceder"
                          onPress={handleResetPassword}
                          loading={loading}
                          rightIcon={
                            <MaterialIcons
                              name="check"
                              size={16}
                              color="#0d0096"
                            />
                          }
                          className="mt-2"
                        />
                      </View>
                    )}

                    {/* Clerk Captcha anchor if required */}
                    <View nativeID="clerk-captcha" />

                    {/* Back to Login link */}
                    <View className="mt-6 pt-4 border-t border-surface-container-high/50 items-center">
                      <Link href="/login" asChild>
                        <TouchableOpacity className="flex-row items-center gap-1.5 py-1">
                          <MaterialIcons name="arrow-back" size={16} color="#c0c1ff" />
                          <Text className="text-xs font-semibold text-primary">
                            Volver a Iniciar Sesión
                          </Text>
                        </TouchableOpacity>
                      </Link>
                    </View>
                  </View>
                </View>
              </View>
            </View>

            {/* Bottom Footer */}
            <AuthFooter
              copyrightText="Tendo POS Enterprise Security • PCI-DSS Compliant • TLS 1.3"
              secondaryText="Sistema Operativo de Punto de Venta v1.0.0"
            />
          </ScrollView>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}
