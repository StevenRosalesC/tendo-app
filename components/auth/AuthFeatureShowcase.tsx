import { MaterialIcons } from "@expo/vector-icons";
import { ReactNode } from "react";
import { Image, Text, View } from "react-native";

export interface CertificationItem {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
}

export interface AuthFeatureShowcaseProps {
  title?: string;
  subtitle?: string;
  showHardwareCard?: boolean;
  children?: ReactNode;
  certifications?: CertificationItem[];
}

const defaultCertifications: CertificationItem[] = [
  { icon: "verified-user", label: "PCI DSS Nivel 1" },
  { icon: "security", label: "Cifrado E2E AES-256" },
  { icon: "fingerprint", label: "SOC 2 Tipo II" },
];

export default function AuthFeatureShowcase({
  title = "Punto de Venta e Inventario",
  subtitle = "Plataforma ágil y sencilla para registrar ventas, cobrar y controlar el inventario de tu tienda en tiempo real.",
  showHardwareCard = true,
  children,
  certifications = defaultCertifications,
}: AuthFeatureShowcaseProps) {
  return (
    <View className="w-full lg:w-7/12 gap-6">
      {/* Hero Title */}
      <View className="gap-2">
        <Text className="text-3xl lg:text-4xl font-extrabold text-on-surface tracking-tight">
          {title}
        </Text>
        <Text className="text-sm lg:text-base text-on-surface-variant leading-relaxed max-w-xl">
          {subtitle}
        </Text>
      </View>

      {/* Optional custom children (e.g. Bento cards or Recovery steps) */}
      {children}

      {/* Hardware Terminal Card */}
      {showHardwareCard && (
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
              Terminales Verifone & Sunmi Homologadas
            </Text>
            <Text className="text-xs text-on-surface-variant mt-0.5">
              Soporte directo para impresoras térmicas ESC/POS, balanzas y
              lectores 2D Zebra.
            </Text>
          </View>
        </View>
      )}

      {/* Security Certifications */}
      {certifications.length > 0 && (
        <View className="flex-row flex-wrap items-center gap-3 pt-1">
          {certifications.map((cert, index) => (
            <View key={cert.label} className="flex-row items-center gap-3">
              {index > 0 && <Text className="text-tertiary-container">•</Text>}
              <View className="flex-row items-center gap-1.5">
                <MaterialIcons name={cert.icon} size={16} color="#c0c1ff" />
                <Text className="text-xs font-medium text-on-surface-variant">
                  {cert.label}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
