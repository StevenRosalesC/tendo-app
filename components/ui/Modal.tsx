import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import {
  KeyboardAvoidingView,
  Modal as RNModal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

export interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: keyof typeof MaterialIcons.glyphMap;
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl";
}

export default function Modal({
  visible,
  onClose,
  title,
  subtitle,
  icon,
  children,
  maxWidth = "md",
}: ModalProps) {
  const { height: screenHeight } = useWindowDimensions();

  if (!visible) return null;

  const maxWidthMap: Record<string, number> = {
    sm: 400,
    md: 520,
    lg: 680,
    xl: 840,
  };

  const maxWidthPx = maxWidthMap[maxWidth] || 520;
  // Ensure modal height leaves comfortable breathing room on all screens and keyboards
  const maxModalHeight = Math.min(Math.round(screenHeight * 0.88), 740);
  const maxBodyHeight = maxModalHeight - 85;

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <View className="flex-1 justify-center items-center p-4">
          {/* Backdrop Tap Target */}
          <TouchableOpacity
            activeOpacity={1}
            onPress={onClose}
            style={StyleSheet.absoluteFill}
            className="bg-black/75"
          />

          {/* Modal Container Card */}
          <View
            style={{
              maxHeight: maxModalHeight,
              maxWidth: maxWidthPx,
              width: "100%",
            }}
            className="bg-surface-container-low border border-surface-container-high rounded-3xl shadow-2xl overflow-hidden flex-col z-10"
          >
            {/* Modal Header */}
            <View className="flex-row items-center justify-between p-5 sm:p-6 border-b border-surface-container-high/60 bg-surface-container">
              <View className="flex-row items-center gap-3 flex-1 mr-3">
                {icon && (
                  <View className="w-10 h-10 rounded-xl bg-primary-container items-center justify-center shrink-0">
                    <MaterialIcons name={icon} size={20} color="#0d0096" />
                  </View>
                )}
                <View className="flex-1">
                  <Text className="text-lg sm:text-xl font-bold text-on-surface leading-snug">
                    {title}
                  </Text>
                  {subtitle && (
                    <Text className="text-xs text-on-surface-variant mt-0.5 leading-tight">
                      {subtitle}
                    </Text>
                  )}
                </View>
              </View>

              <TouchableOpacity
                onPress={onClose}
                activeOpacity={0.7}
                className="w-8 h-8 rounded-full bg-surface-container-highest items-center justify-center"
              >
                <MaterialIcons name="close" size={18} color="#c7c4d7" />
              </TouchableOpacity>
            </View>

            {/* Modal Body */}
            <ScrollView
              style={{ maxHeight: maxBodyHeight, flexGrow: 0 }}
              contentContainerClassName="p-5 sm:p-6"
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              bounces={false}
            >
              {children}
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </RNModal>
  );
}
