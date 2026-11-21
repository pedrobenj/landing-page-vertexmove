interface StoreOrderPickupItemProps {
  info: string
}

export function StoreOrderPickupItem({ info }: StoreOrderPickupItemProps) {
  return <li>{info}</li>
}
