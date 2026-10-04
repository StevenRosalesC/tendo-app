import { MaterialIcons } from "@expo/vector-icons";
import ModulePlaceholder from "../../../components/dashboard/ModulePlaceholder";
import Button from "../../../components/ui/Button";

export default function TerminalScreen() {
  return (
    <ModulePlaceholder
      iconName="point-of-sale"
      iconColor="#0d0096"
      iconBgColor="bg-primary-container"
      title="Terminal de Cobro Rápido"
      description="Punto de venta activo. Escaneo de códigos de barra, cobro con tarjeta contactless y efectivo."
    >
      <Button
        label="Escanear Código / Nuevo Ticket"
        leftIcon={
          <MaterialIcons name="qr-code-scanner" size={20} color="#0d0096" />
        }
        fullWidth
        className="mt-6"
      />
    </ModulePlaceholder>
  );
}
