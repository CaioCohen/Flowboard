// Pages
export { NotificationsPage } from "./pages/notifications";
export { ProfilePage } from "./pages/profile";

// Services and public types
export { AccountApiError, getCurrentUser, getNotifications, markNotificationRead } from "./services/account-api";
export type { ICurrentUser, INotification } from "./services/account-api";

// Presentation utilities
export { getInitials, hasUnreadNotifications } from "./utils/account-presentation";
export { getProfileDisplayName } from "./utils/profile-presentation";
