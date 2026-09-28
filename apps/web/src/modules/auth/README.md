# Auth module

Owns the public `/login` and `/register` routes, browser-session handling, and authentication API calls.

Successful authentication stores only the JWT under `sessionStorage["token"]`; the authenticated identity remains in memory. Protected API calls should use `authorizedFetch`, which invokes the registered unauthorized handler on a `401`.
