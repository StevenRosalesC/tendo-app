import { ActivityIndicator, Image, Text, TouchableOpacity } from "react-native";

export interface SocialAuthButtonProps {
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  label?: string;
}

export default function SocialAuthButton({
  onPress,
  loading = false,
  disabled = false,
  label = "Continuar con Google Workspace",
}: SocialAuthButtonProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={disabled || loading}
      onPress={onPress}
      className={`w-full h-11 bg-surface-container rounded-xl flex-row items-center justify-center gap-3 border border-surface-container-high active:bg-surface-container-high ${
        disabled || loading ? "opacity-60" : ""
      }`}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#c0c1ff" />
      ) : (
        <>
          <Image
            source={{
              uri: "https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg",
            }}
            className="w-4 h-4"
          />
          <Text className="text-xs font-semibold text-on-surface">
            {label}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}
