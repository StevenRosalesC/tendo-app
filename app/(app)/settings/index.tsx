import { useAuth } from "@clerk/expo";
import ModulePlaceholder from "../../../components/dashboard/ModulePlaceholder";
import Button from "../../../components/ui/Button";

export default function SettingsScreen() {
  const { signOut } = useAuth();

  return (
    <ModulePlaceholder
      iconName="settings"
      iconColor="#c0c1ff"
      title="Configuración de Terminal POS"
      description="Ajustes de estación, periféricos de impresión térmica, configuración de nodo y credenciales."
    >
      <Button
        label="Cerrar sesión de operador"
        variant="danger"
        fullWidth
        onPress={() => signOut()}
        className="mt-8"
      />
    </ModulePlaceholder>
  );
}
