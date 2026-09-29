import { expect, test, type Page, type Route } from "@playwright/test";

type Member = { id: string; email: string; name: string; role: "ADMIN" | "EMPLOYEE"; userId?: string };
type Ticket = { id: string; workspaceId: string; title: string; description?: string; status: string; priority?: string; assigneeId?: string; createdById: string; createdAt: string; updatedAt: string; assignee?: { id: string; email: string; name: string } };
type Notification = { id: string; type: string; title: string; message: string; isRead: boolean; createdAt: string; workspaceId?: string; workspaceName?: string };

const user = { id: "user-alice", firstName: "Alice", lastName: "Admin", email: "alice@example.test" };
const member = { id: "user-bob", userId: "user-bob", name: "Bob Member", email: "bob@example.test", role: "EMPLOYEE" as const };
const json = (route: Route, body: unknown, status = 200) => route.fulfill({ status, contentType: "application/json", body: JSON.stringify(body) });

async function installApi(page: Page): Promise<void> {
  let registered = false;
  let workspace: { id: string; name: string; role: "ADMIN"; members: Member[] } | undefined;
  let tickets: Ticket[] = [];
  let notifications: Notification[] = [];
  let nextTicket = 1;

  await page.route("**/auth/**", async (route) => {
    const request = route.request();
    const body = request.postDataJSON() as { email: string };
    if (request.url().endsWith("/auth/register")) {
      if (registered) return json(route, { message: "Email is already in use." }, 409);
      registered = true;
    } else if (!registered || body.email !== user.email) return json(route, { message: "Invalid credentials" }, 401);
    return json(route, { token: "deterministic-token", user });
  });

  await page.route("**/users/me", (route) => json(route, user));
  await page.route("**/notifications", (route) => json(route, notifications));
  await page.route("**/notifications/*/read", (route) => {
    const notification = notifications.find((item) => route.request().url().includes(item.id));
    if (!notification) return json(route, { message: "Not found" }, 404);
    notification.isRead = true;
    return json(route, notification);
  });
  await page.route("**/workspaces", async (route) => {
    const request = route.request();
    if (request.method() === "GET") return json(route, workspace ? [workspace] : []);
    const { name } = request.postDataJSON() as { name: string };
    workspace = { id: "workspace-product", name, role: "ADMIN", members: [{ ...user, name: "Alice Admin", role: "ADMIN", userId: user.id }] };
    return json(route, workspace, 201);
  });
  await page.route("**/workspaces/*", async (route) => {
    if (!workspace) return json(route, { message: "Not found" }, 404);
    const request = route.request();
    if (request.url().endsWith("/leave")) return json(route, undefined, 204);
    if (request.method() === "GET") return json(route, workspace);
    if (request.method() === "PATCH") {
      workspace.name = (request.postDataJSON() as { name: string }).name;
      return json(route, workspace);
    }
    return json(route, { message: "Not found" }, 404);
  });
  await page.route("**/workspaces/*/members", async (route) => {
    if (!workspace) return json(route, { message: "Not found" }, 404);
    const { email, role } = route.request().postDataJSON() as { email: string; role: Member["role"] };
    if (workspace.members.some((item) => item.email === email)) return json(route, { message: "User is already a member." }, 409);
    const added = { ...member, email, role };
    workspace.members.push(added);
    notifications = [{ id: "notification-member-added", type: "MEMBER_ADDED", title: "Added to workspace", message: `${email} joined ${workspace.name}.`, isRead: false, createdAt: "2026-01-01T00:00:00.000Z", workspaceId: workspace.id, workspaceName: workspace.name }];
    return json(route, added, 201);
  });
  await page.route("**/workspaces/*/tickets", async (route) => {
    const request = route.request();
    if (request.method() === "GET") return json(route, tickets);
    const draft = request.postDataJSON() as Omit<Ticket, "id" | "workspaceId" | "createdById" | "createdAt" | "updatedAt">;
    const ticket: Ticket = { ...draft, id: `ticket-${nextTicket++}`, workspaceId: "workspace-product", createdById: user.id, createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z", assignee: draft.assigneeId ? { id: member.id, email: member.email, name: member.name } : undefined };
    tickets.push(ticket);
    return json(route, ticket, 201);
  });
  await page.route("**/tickets/*", async (route) => {
    const ticket = tickets.find((item) => route.request().url().endsWith(item.id));
    if (!ticket) return json(route, { message: "Not found" }, 404);
    if (route.request().method() === "DELETE") { tickets = tickets.filter((item) => item.id !== ticket.id); return json(route, undefined, 204); }
    Object.assign(ticket, route.request().postDataJSON(), { updatedAt: "2026-01-02T00:00:00.000Z" });
    return json(route, ticket);
  });
}

async function register(page: Page): Promise<void> {
  await page.goto("/register");
  await page.getByLabel("First name").fill("Alice");
  await page.getByLabel("Last name").fill("Admin");
  await page.getByLabel("Email").fill(user.email);
  await page.getByLabel("Password", { exact: true }).fill("CorrectHorse1!");
  await page.getByLabel("Confirm password").fill("CorrectHorse1!");
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page).toHaveURL(/\/workspaces$/);
}

test.beforeEach(async ({ page }) => { await installApi(page); });

test("a user completes the workspace, member, ticket, notification, profile, and login journey", async ({ page }) => {
  await register(page);
  await expect(page.getByText("You do not belong to a workspace yet")).toBeVisible();

  await page.getByRole("button", { name: "Create workspace" }).click();
  await page.getByRole("dialog", { name: "Create workspace" }).getByLabel("Name").fill("Product");
  await page.getByRole("dialog", { name: "Create workspace" }).getByRole("button", { name: "Create Workspace" }).click();
  await expect(page.getByRole("heading", { name: "Product" })).toBeVisible();

  await page.getByRole("button", { name: "Manage" }).click();
  const dialog = page.getByRole("dialog", { name: "Edit Product" });
  await dialog.getByLabel("Email").fill(member.email);
  await dialog.getByLabel("Role").selectOption("EMPLOYEE");
  await dialog.getByRole("button", { name: "Add member" }).click();
  await expect(dialog.getByText("Member added.")).toBeVisible();
  await dialog.getByRole("button", { name: "Close" }).click();

  await page.getByRole("button", { name: "Open workspace" }).click();
  await expect(page.getByRole("heading", { name: "Product" })).toBeVisible();
  await page.getByRole("button", { name: "Create ticket" }).click();
  await page.getByRole("dialog", { name: "Create ticket" }).getByLabel("Title").fill("Ship deterministic E2E tests");
  await page.getByLabel("Status").selectOption("IN_PROGRESS");
  await page.getByLabel("Priority").selectOption("HIGH");
  await page.getByLabel("Description").fill("Cover the real browser journey.");
  await page.getByLabel("Assignee").fill("Bob Member (bob@example.test)");
  await page.getByRole("button", { name: "Save ticket" }).click();
  await expect(page.getByRole("heading", { name: "Ship deterministic E2E tests" })).toBeVisible();

  await page.getByRole("button", { name: "Edit" }).click();
  await page.getByRole("dialog", { name: "Edit ticket" }).getByLabel("Status").selectOption("DONE");
  await page.getByRole("button", { name: "Save ticket" }).click();
  await expect(page.getByText("Done")).toBeVisible();

  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Delete" }).click();
  await page.getByRole("button", { name: "Create ticket" }).waitFor();
  await expect(page.getByText("No tickets yet")).toBeVisible();

  await page.getByLabel("Notifications").click();
  await expect(page.getByRole("heading", { name: "Notifications" })).toBeVisible();
  await page.getByRole("button", { name: "Mark as read" }).click();
  await expect(page.getByText("Read", { exact: true })).toBeVisible();

  await page.getByLabel("Open account menu").click();
  await page.getByRole("link", { name: "Profile" }).click();
  await expect(page.getByRole("region", { name: "Your identity" }).locator("p").filter({ hasText: user.email })).toBeVisible();
  await page.getByRole("button", { name: "Log out" }).click();
  await expect(page).toHaveURL(/\/login$/);
  await page.getByLabel("Email").fill(user.email);
  await page.getByLabel("Password").fill("CorrectHorse1!");
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page).toHaveURL(/\/workspaces$/);
});

test("validation, duplicate registration, invalid credentials, and ticket validation show actionable errors", async ({ page }) => {
  await page.goto("/register");
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page.getByText("First name is required.")).toBeVisible();
  await expect(page.getByText("Password must be at least 8 characters.")).toBeVisible();
  await register(page);
  await page.getByLabel("Open account menu").click();
  await page.getByRole("button", { name: "Log out" }).click();
  await page.getByRole("link", { name: "Create one" }).click();
  await page.getByLabel("First name").fill("Alice"); await page.getByLabel("Last name").fill("Admin"); await page.getByLabel("Email").fill(user.email); await page.getByLabel("Password", { exact: true }).fill("CorrectHorse1!"); await page.getByLabel("Confirm password").fill("CorrectHorse1!");
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page.getByText("Email is already in use.")).toBeVisible();
  await page.getByRole("link", { name: "Log in" }).click();
  await page.getByLabel("Email").fill("wrong@example.test"); await page.getByLabel("Password").fill("CorrectHorse1!");
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page.getByRole("alert")).toContainText("Email or password is incorrect.");
  await page.getByLabel("Email").fill(user.email); await page.getByRole("button", { name: "Log in" }).click();
  await page.getByRole("button", { name: "Create workspace" }).click();
  const workspaceDialog = page.getByRole("dialog", { name: "Create workspace" });
  await workspaceDialog.getByRole("button", { name: "Create Workspace" }).click();
  await expect(workspaceDialog.getByRole("alert")).toContainText("Workspace name is required.");
  await workspaceDialog.getByLabel("Name").fill("Product");
  await workspaceDialog.getByRole("button", { name: "Create Workspace" }).click();
  await page.getByRole("button", { name: "Open workspace" }).click();
  await page.getByRole("button", { name: "Create ticket" }).click();
  const ticketDialog = page.getByRole("dialog", { name: "Create ticket" });
  await ticketDialog.getByRole("button", { name: "Save ticket" }).click();
  await expect(ticketDialog.getByRole("alert")).toContainText("Ticket title is required.");
});
