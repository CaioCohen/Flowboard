import { useCallback, useEffect, useState, type FormEvent } from "react";

import { workspaceApi } from "../../services/workspace-api";
import type { IWorkspace, WorkspaceRole } from "../../types/workspace";
import { workspaceErrorMessage } from "../../utils/workspace-error";
import { workspaceNameError } from "../../utils/workspace-validation";
import { workspacePageClassNames } from "./workspaces.styles";

interface IWorkspacesPageProps { accessToken: string; onOpenWorkspace: (workspaceId: string) => void }

export function WorkspacesPage({ accessToken, onOpenWorkspace }: IWorkspacesPageProps) {
  const [workspaces, setWorkspaces] = useState<IWorkspace[]>();
  const [error, setError] = useState<string>();
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<IWorkspace>();
  const load = useCallback(async () => {
    setError(undefined);
    try { setWorkspaces(await workspaceApi.list(accessToken)); } catch (cause) { setError(workspaceErrorMessage(cause, "load your workspaces")); }
  }, [accessToken]);
  useEffect(() => { void load(); }, [load]);

  async function leave(workspace: IWorkspace) {
    if (!window.confirm("Are you sure you want to leave this workspace?")) return;
    try { await workspaceApi.leave(accessToken, workspace.id); await load(); } catch (cause) { setError(workspaceErrorMessage(cause, "leave this workspace")); }
  }

  return <section className={workspacePageClassNames.page} aria-labelledby="workspaces-heading">
    <header className="workspace-page__header"><div><p className="workspace-page__eyebrow">Workspace directory</p><h1 id="workspaces-heading">My Workspaces</h1><p className="workspace-page__subtitle">Organize your team’s work in one focused place.</p></div><button className="workspace-primary-action" onClick={() => setCreating(true)}>Create workspace</button></header>
    {error && <p className={workspacePageClassNames.error} role="alert">{error}</p>}
    {!workspaces && !error && <p aria-live="polite">Loading workspaces…</p>}
    {workspaces?.length === 0 && <p>You do not belong to a workspace yet. Create your first workspace to get started.</p>}
    <div className="workspace-grid">
      {workspaces?.map((workspace) => <article key={workspace.id} className={workspacePageClassNames.card}>
        <div className="workspace-card__heading"><span className="workspace-card__mark" aria-hidden="true">{workspace.name.trim().charAt(0).toUpperCase()}</span><span className="workspace-role">{workspace.role === "ADMIN" ? "Admin" : "Member"}</span></div>
        <h2>{workspace.name}</h2><p>Manage tickets, teammates, and the work that moves your team forward.</p>
        <div className="workspace-card__actions"><button className="workspace-primary-action" onClick={() => onOpenWorkspace(workspace.id)}>Open workspace</button>{workspace.role === "ADMIN" && <button className="workspace-secondary-action" onClick={() => setEditing(workspace)}>Manage</button>}<button className="workspace-leave-action" onClick={() => void leave(workspace)}>Leave</button></div>
      </article>)}
    </div>
    {creating && <WorkspaceForm title="Create workspace" submitLabel="Create Workspace" onClose={() => setCreating(false)} onSubmit={async (name) => { await workspaceApi.create(accessToken, name); await load(); setCreating(false); }} />}
    {editing && <EditWorkspaceDialog accessToken={accessToken} workspace={editing} onClose={() => setEditing(undefined)} onChanged={load} />}
  </section>;
}

function WorkspaceForm({ title, submitLabel, initialName = "", onClose, onSubmit }: { title: string; submitLabel: string; initialName?: string; onClose: () => void; onSubmit: (name: string) => Promise<void> }) {
  const [name, setName] = useState(initialName); const [saving, setSaving] = useState(false); const [error, setError] = useState<string>();
  async function submit(event: FormEvent) { event.preventDefault(); const validation = workspaceNameError(name); if (validation) return setError(validation); setSaving(true); setError(undefined); try { await onSubmit(name.trim()); } catch (cause) { setError(workspaceErrorMessage(cause, "save the workspace")); setSaving(false); } }
  return <dialog open className={workspacePageClassNames.dialog} aria-label={title}><form onSubmit={(event) => void submit(event)}><h2>{title}</h2>{error && <p role="alert">{error}</p>}<label>Name<input autoFocus value={name} onChange={(event) => setName(event.target.value)} disabled={saving} /></label><button type="submit" disabled={saving}>{saving ? "Saving…" : submitLabel}</button><button type="button" onClick={onClose} disabled={saving}>Cancel</button></form></dialog>;
}

function EditWorkspaceDialog({ accessToken, workspace, onClose, onChanged }: { accessToken: string; workspace: IWorkspace; onClose: () => void; onChanged: () => Promise<void> }) {
  const [members, setMembers] = useState(workspace.members ?? []); const [notice, setNotice] = useState<string>(); const [name, setName] = useState(workspace.name);
  async function saveName(event: FormEvent) { event.preventDefault(); const validation = workspaceNameError(name); if (validation) return setNotice(validation); try { await workspaceApi.rename(accessToken, workspace.id, name.trim()); await onChanged(); setNotice("Workspace renamed."); } catch (cause) { setNotice(workspaceErrorMessage(cause, "rename this workspace")); } }
  async function addMember(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const form = event.currentTarget; const data = new FormData(form); try { const member = await workspaceApi.addMember(accessToken, workspace.id, String(data.get("email")), String(data.get("role")) as WorkspaceRole); setMembers((current) => [...current, member]); await onChanged(); form.reset(); setNotice("Member added."); } catch (cause) { setNotice(workspaceErrorMessage(cause, "add this member")); } }
  async function changeRole(userId: string, role: WorkspaceRole) { try { await workspaceApi.changeMemberRole(accessToken, workspace.id, userId, role); setMembers(members.map((member) => (member.userId ?? member.id) === userId ? { ...member, role } : member)); } catch (cause) { setNotice(workspaceErrorMessage(cause, "change this member's role")); } }
  async function removeMember(userId: string) { if (!window.confirm("Are you sure you want to remove this member?")) return; try { await workspaceApi.removeMember(accessToken, workspace.id, userId); setMembers(members.filter((member) => (member.userId ?? member.id) !== userId)); await onChanged(); } catch (cause) { setNotice(workspaceErrorMessage(cause, "remove this member")); } }
  return <dialog open className={workspacePageClassNames.dialog} aria-label={`Edit ${workspace.name}`}><h2>Edit workspace</h2>{notice && <p role="alert">{notice}</p>}<form onSubmit={(event) => void saveName(event)}><label>Name<input value={name} onChange={(event) => setName(event.target.value)} /></label><button>Save name</button></form><h2>Manage members</h2><form onSubmit={(event) => void addMember(event)}><label>Email<input name="email" type="email" required /></label><label>Role<select name="role" defaultValue="EMPLOYEE"><option value="EMPLOYEE">EMPLOYEE</option><option value="ADMIN">ADMIN</option></select></label><button>Add member</button></form><ul>{members.map((member) => { const id = member.userId ?? member.id; return <li key={id}>{member.name ?? member.email ?? id} ({member.email}) <select value={member.role} onChange={(event) => void changeRole(id, event.target.value as WorkspaceRole)}><option value="EMPLOYEE">EMPLOYEE</option><option value="ADMIN">ADMIN</option></select><button onClick={() => void removeMember(id)}>Remove</button></li>; })}</ul><button onClick={onClose}>Close</button></dialog>;
}
