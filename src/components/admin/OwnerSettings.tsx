import { useEffect, useState, type FormEvent } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import type { User, RoleType, Region } from '../../types';

const roles: Record<RoleType, string> = {
  global_admin: 'Direção global',
  regional_coordinator: 'Coordenação regional',
  evangelism_leader: 'Liderança de evangelismo',
  consolidation_team: 'Consolidação',
  teaching_team: 'Ensino',
  media_team: 'Mídia',
};
export function OwnerSettings() {
  const { currentUser, logout } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [editing, setEditing] = useState<User | null>(null);
  const [role, setRole] = useState<RoleType>('regional_coordinator');
  const [version, setVersion] = useState(0);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let active = true;
    if (currentUser?.id === 'platform-owner')
      Promise.all([api.getManagedUsers(), api.getRegions()])
        .then(([list, rs]) => {
          if (active) {
            setUsers(list);
            setRegions(rs);
            setReady(true);
          }
        })
        .catch((e) => {
          if (active) setMessage(e.message);
        });
    return () => {
      active = false;
    };
  }, [currentUser?.id]);
  function edit(user: User | null) {
    setEditing(user);
    setRole(user?.role ?? 'regional_coordinator');
    setVersion((v) => v + 1);
  }
  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    const fields = new FormData(e.currentTarget);
    const password = String(fields.get('password'));
    const data = {
      name: String(fields.get('name')),
      email: String(fields.get('email')),
      role,
      regionId: String(fields.get('region') ?? ''),
      active: fields.get('active') === 'on',
    };
    setBusy(true);
    setMessage('');
    try {
      const saved = editing
        ? await api.updateUser(editing.id, {
            ...data,
            ...(password ? { password } : {}),
          })
        : await api.createUser({ ...data, password });
      setUsers((list) =>
        editing
          ? list.map((u) => (u.id === saved.id ? saved : u))
          : [...list, saved],
      );
      edit(null);
      setMessage('Conta salva.');
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function remove(user: User) {
    if (
      busy ||
      !window.confirm(
        'Excluir definitivamente a conta de ' +
          user.name +
          ' (' +
          user.email +
          ')?',
      )
    )
      return;
    setBusy(true);
    try {
      await api.deleteUser(user.id);
      setUsers((list) => list.filter((u) => u.id !== user.id));
      if (editing?.id === user.id) edit(null);
      setMessage('Conta excluída.');
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="mx-auto max-w-4xl p-4 sm:p-8 text-slate-900">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Configuração administrativa</h1>
        <button
          onClick={() => void logout()}
          className="rounded border px-4 py-2"
        >
          Sair
        </button>
      </header>
      {currentUser?.id !== 'platform-owner' ? (
        <p>
          Acesso exclusivo do proprietário. Saia para entrar com a conta
          autorizada.
        </p>
      ) : (
        <>
          <a href="/admin" className="underline">
            Abrir painel administrativo
          </a>
          <p role="status" className="my-3">
            {message}
          </p>
          {ready && (
            <>
              <form
                key={version}
                onSubmit={save}
                className="grid gap-4 rounded-xl border bg-white p-5 sm:grid-cols-2 [&_input:not([type=checkbox])]:w-full [&_input]:rounded [&_input]:border [&_input]:p-2 [&_select]:w-full [&_select]:rounded [&_select]:border [&_select]:p-2"
              >
                <h2 className="text-lg font-bold sm:col-span-2">
                  {editing ? 'Editar conta' : 'Nova conta'}
                </h2>
                <label>
                  Nome
                  <input
                    name="name"
                    required
                    minLength={2}
                    defaultValue={editing?.name}
                  />
                </label>
                <label>
                  E-mail
                  <input
                    name="email"
                    type="email"
                    required
                    defaultValue={editing?.email}
                  />
                </label>
                <label>
                  Perfil
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as RoleType)}
                  >
                    {Object.entries(roles).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Regional
                  <select
                    name="region"
                    disabled={role === 'global_admin'}
                    required={[
                      'regional_coordinator',
                      'evangelism_leader',
                      'consolidation_team',
                    ].includes(role)}
                    defaultValue={editing?.regionId ?? ''}
                  >
                    <option value="">Sem regional</option>
                    {regions.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  {editing ? 'Nova senha (opcional)' : 'Senha inicial'}
                  <input
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required={!editing}
                    minLength={8}
                  />
                </label>
                {editing && (
                  <label>
                    <input
                      type="checkbox"
                      name="active"
                      defaultChecked={editing.active !== false}
                    />{' '}
                    Conta ativa
                  </label>
                )}
                <div className="flex gap-4 sm:col-span-2">
                  <button
                    disabled={busy}
                    className="rounded bg-slate-900 px-5 py-2 text-white"
                  >
                    Salvar conta
                  </button>
                  {editing && (
                    <button type="button" onClick={() => edit(null)}>
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
              <h2 className="mt-8 text-lg font-bold">
                Usuários ({users.length})
              </h2>
              {users.map((u) => (
                <article
                  key={u.id}
                  className="flex flex-wrap items-center justify-between gap-3 border-b py-4"
                >
                  <div className="min-w-0 break-words">
                    <strong>{u.name}</strong>
                    <p>{u.email}</p>
                    <small>
                      {roles[u.role]} ·{' '}
                      {u.active === false ? 'Inativa' : 'Ativa'}
                    </small>
                  </div>
                  <div className="flex gap-4">
                    <button
                      disabled={busy}
                      onClick={() => {
                        edit(u);
                        window.scrollTo(0, 0);
                      }}
                    >
                      Editar
                    </button>
                    <button
                      disabled={busy}
                      className="text-red-800"
                      onClick={() => void remove(u)}
                    >
                      Excluir
                    </button>
                  </div>
                </article>
              ))}
            </>
          )}
        </>
      )}
    </main>
  );
}
