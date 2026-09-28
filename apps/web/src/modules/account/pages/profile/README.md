# Profile page

Route: `/profile`. Requires an authenticated token and loads the authoritative identity from `GET /users/me`. It exposes only safe identity fields and delegates unauthorized handling to the app shell.
