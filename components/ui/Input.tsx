import { MaterialIcons } from "@expo/vector-icons";
import { ReactNode, useState } from "react";
import {
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from "react-native";

export interface InputProps extends TextInputProps {
  label?: string;
  rightLabel?: ReactNode;
  iconName?: keyof typeof MaterialIcons.glyphMap;
  iconColor?: string;
  isPassword?: boolean;
  error?: string | null;
  helperText?: string;
  containerClassName?: string;
  inputClassName?: string;
}

export default function Input({
  label,
  rightLabel,
  iconName,
  iconColor = "#c7c4d7",
  isPassword = false,
  error,
  helperText,
  containerClassName = "",
  inputClassName = "",
  secureTextEntry,
  ...textInputProps
}: InputProps) {
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const isSecure = isPassword ? !showPassword : secureTextEntry;

  return (
    <View className={`gap-1.5 ${containerClassName}`}>
      {(label || rightLabel) && (
        <View className="flex-row justify-between items-center">
          {label && (
            <Text className="text-xs font-medium text-on-surface">{label}</Text>
          )}
          {rightLabel}
        </View>
      )}

      <View
        className={`flex-row items-center bg-surface-container-highest rounded-xl px-3 h-11 border ${
          error
            ? "border-status-danger/60"
            : "border-surface-container-high focus:border-primary/60"
        }`}
      >
        {iconName && (
          <MaterialIcons
            name={iconName}
            size={18}
            color={error ? "#EF4444" : iconColor}
          />
        )}

        <TextInput
          placeholderTextColor="#77767e"
          secureTextEntry={isSecure}
          className={`flex-1 text-sm text-on-surface ${
            iconName ? "ml-2.5" : ""
          } ${inputClassName}`}
          {...textInputProps}
        />

        {isPassword && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setShowPassword(!showPassword)}
            className="p-1"
          >
            <MaterialIcons
              name={showPassword ? "visibility-off" : "visibility"}
              size={18}
              color="#c7c4d7"
            />
          </TouchableOpacity>
        )}
      </View>

      {error ? (
        <Text className="text-xs text-status-danger font-medium">{error}</Text>
      ) : helperText ? (
        <Text className="text-[11px] text-on-surface-variant font-medium">
          {helperText}
        </Text>
      ) : null}
    </View>
  );
}
