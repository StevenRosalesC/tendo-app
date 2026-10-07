import { useOrganization } from "@clerk/expo";
import { MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Alert, Platform, Text, View } from "react-native";

import AlertBanner from "../ui/AlertBanner";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Modal from "../ui/Modal";

interface InviteMemberModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function InviteMemberModal({
  visible,
  onClose,
  onSuccess,
}: InviteMemberModalProps) {
  const { organization, isLoaded } = useOrganization();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleClose = () => {
    if (isSubmitting) return;
    setEmail("");
    setErrorMessage(null);
    onClose();
  };

  const handleSendInvite = async () => {
    const trimmedEmail = email.trim().toLowerCase();
    setErrorMessage(null);

    if (!trimmedEmail) {
      setErrorMessage("Por favor ingresa un correo electrónico.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setErrorMessage("El formato de correo electrónico no es válido.");
      return;
    }

    if (!organization) {
      setErrorMessage(
        "No se encontró la organización activa. Por favor recarga la aplicación."
      );
      return;
    }

    try {
      setIsSubmitting(true);
      await organization.inviteMember({
        emailAddress: trimmedEmail,
        role: "org:member",
      });

      const successTitle = "Invitación enviada";
      const successBody = `Se ha enviado la invitación a ${trimmedEmail}. Al iniciar sesión en Tendo se incorporará a tu equipo.`;

      if (Platform.OS === "web") {
        window.alert(`${successTitle}\n\n${successBody}`);
      } else {
        Alert.alert(successTitle, successBody);
      }

      setEmail("");
      onSuccess?.();
      onClose();
    } catch (err: any) {
      console.error("Error inviting organization member:", err);
      const clerkErrMessage =
        err?.errors?.[0]?.longMessage ||
        err?.errors?.[0]?.message ||
        err?.message ||
        "No se pudo enviar la invitación. Inténtalo de nuevo.";

      if (
        clerkErrMessage.toLowerCase().includes("already") ||
        err?.errors?.[0]?.code === "form_identifier_exists"
      ) {
        setErrorMessage(
          "Este correo ya cuenta con una invitación pendiente o ya es miembro del equipo."
        );
      } else {
        setErrorMessage(clerkErrMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      onClose={handleClose}
      title="Invitar Colaborador"
      subtitle="Envía una invitación oficial por correo para unirse a la tienda"
      icon="person-add"
      maxWidth="md"
    >
      <View className="gap-5">
        {errorMessage && (
          <AlertBanner
            type="error"
            message={errorMessage}
          />
        )}

        {/* Informative onboarding card */}
        <View className="bg-primary/10 border border-primary/25 rounded-2xl p-4 flex-row items-start gap-3">
          <View className="w-8 h-8 rounded-xl bg-primary/20 items-center justify-center shrink-0 mt-0.5">
            <MaterialIcons name="auto-awesome" size={18} color="#c0c1ff" />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-semibold text-primary leading-snug">
              Invitación y acceso directo
            </Text>
            <Text className="text-xs text-on-surface-variant mt-1 leading-relaxed">
              El colaborador recibirá un correo con el enlace de acceso a la tienda. Al ingresar por primera vez, podrás asignarle su puesto de Cajero o Gerente con un toque.
            </Text>
          </View>
        </View>

        {/* Email input field */}
        <Input
          label="Correo electrónico del colaborador"
          placeholder="ejemplo: cajero@tienda.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            if (errorMessage) setErrorMessage(null);
          }}
          iconName="email"
          editable={!isSubmitting}
        />

        {/* Modal Action Buttons */}
        <View className="flex-row items-center justify-end gap-3 pt-2">
          <Button
            label="Cancelar"
            variant="ghost"
            onPress={handleClose}
            disabled={isSubmitting}
          />
          <Button
            label={isSubmitting ? "Enviando..." : "Enviar Invitación"}
            variant="primary"
            loading={isSubmitting}
            disabled={isSubmitting || !isLoaded}
            onPress={handleSendInvite}
            leftIcon={
              !isSubmitting ? (
                <MaterialIcons name="send" size={18} color="#0d0096" />
              ) : undefined
            }
          />
        </View>
      </View>
    </Modal>
  );
}
