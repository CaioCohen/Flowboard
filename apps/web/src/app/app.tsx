import { initializeAuthentication } from "@/modules/auth";
import { AppRoutes } from "@/routes";

initializeAuthentication();

export function App() {
  return <AppRoutes />;
}
