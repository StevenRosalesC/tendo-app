import ModulePlaceholder from "../../../components/dashboard/ModulePlaceholder";

export default function InventoryScreen() {
  return (
    <ModulePlaceholder
      iconName="inventory"
      iconColor="#c0c1ff"
      title="Catálogo & Inventario de Tienda"
      description="Consulta de catálogo comercial, existencias en tiempo real, alertas de stock mínimo y precios sincronizados."
      badgeText="145 artículos activos en catálogo"
    />
  );
}
