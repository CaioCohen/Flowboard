# Notifications page

Route: `/notifications`. Requires an authenticated token, loads `GET /notifications`, and marks one item read with `PATCH /notifications/:id/read`. The app shell should use `onNotificationRead` to update its shared unread indicator.
