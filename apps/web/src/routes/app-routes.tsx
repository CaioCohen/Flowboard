/**
 * The router is intentionally the only routing boundary. Future routes mount
 * page components exported from feature-module barrels; product code stays out
 * of this layer.
 */
export function AppRoutes() {
  return <main aria-label="Flowboard application" />;
}
