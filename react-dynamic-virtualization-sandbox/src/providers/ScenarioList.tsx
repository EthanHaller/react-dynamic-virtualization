import { getListProvider } from "./providerRegistry"
import type { ProviderListProps } from "./types"

export function ScenarioList(props: ProviderListProps) {
  const { List } = getListProvider(props.config.providerId)
  return <List {...props} />
}
