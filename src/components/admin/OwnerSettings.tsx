import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ArrowDown, ArrowUpRight, LogOut, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';
import './owner-settings.css';
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
  const editorTitle = useRef<HTMLHeadingElement>(null);
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [editing, setEditing] = useState<User | null>(null);
  const [role, setRole] = useState<RoleType>('regional_coordinator');
  const [version, setVersion] = useState(0);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ text: string; error?: boolean } | null>(null);
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
          if (active) setNotice({ text: e.message, error: true });
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
    setNotice(null);
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
      setNotice({ text: 'Conta salva.' });
    } catch (e) {
      setNotice({ text: (e as Error).message, error: true });
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
      setNotice({ text: 'Conta excluída.' });
    } catch (e) {
      setNotice({ text: (e as Error).message, error: true });
    } finally {
      setBusy(false);
    }
  }

  function openEditor(user: User | null) {
    edit(user);
    editorTitle.current?.focus({ preventScroll: true });
    editorTitle.current?.scrollIntoView({ block: 'nearest' });
  }

  const isOwner = currentUser?.id === 'platform-owner';
  const activeCount = users.filter(user => user.active !== false).length;
  const query = search.trim().toLocaleLowerCase();
  const visibleUsers = users.filter(user =>
    [user.name, user.email, roles[user.role]].join(' ').toLocaleLowerCase().includes(query),
  );
  const regionNames = new Map(regions.map(region => [region.id, region.name]));

  return (
    <main className="owner-settings">
      <header className="owner-topbar">
        <div className="owner-width owner-topbar-inner">
          <BrandLogo variant="white" size="sm" showSubtitle={false} />
          <nav className="owner-topbar-actions" aria-label="Navegação da configuração">
            {isOwner && <a href="/" aria-label="Portal da Liderança"><span className="owner-portal-label">Portal da Liderança</span><span className="owner-portal-short" aria-hidden="true">Portal</span><ArrowUpRight size={15} aria-hidden="true" /></a>}
            <button type="button" onClick={() => void logout()}><LogOut size={16} aria-hidden="true" /> Sair</button>
          </nav>
        </div>
      </header>

      <section className="owner-hero" aria-labelledby="owner-title">
        <div className="owner-width owner-hero-inner">
          <div className="owner-hero-copy">
            <h1 id="owner-title">Gestão de usuários</h1>
            <p>Cadastre pessoas, atribua perfis e gerencie o acesso ao portal.</p>
            {ready && (
              <button type="button" className="owner-primary" disabled={busy} onClick={() => openEditor(null)}>
                <Plus size={18} aria-hidden="true" /> Nova conta <ArrowDown className="owner-cta-arrow" size={15} aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      </section>

      {isOwner ? (
        <div className="owner-width owner-body">
          {!ready && <p className="owner-load" role={notice?.error ? 'alert' : 'status'}>{notice?.text ?? 'Carregando contas…'}</p>}

          {ready && (
            <>
              <dl className="owner-summary" aria-label="Resumo de contas">
                <div><dt>Contas cadastradas</dt><dd>{users.length}</dd></div>
                <div><dt>Ativas</dt><dd>{activeCount}</dd></div>
                <div><dt>Inativas</dt><dd>{users.length - activeCount}</dd></div>
              </dl>

              <div className="owner-workspace">
                <section className="owner-directory" aria-labelledby="owner-directory-title">
                  <div className="owner-directory-head">
                    <h2 id="owner-directory-title">Contas</h2>
                    <label className="owner-search">
                      <span className="sr-only">Buscar usuário</span>
                      <Search size={18} aria-hidden="true" />
                      <input type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Nome, e-mail ou perfil" />
                    </label>
                  </div>

                  {visibleUsers.length === 0 ? (
                    <p className="owner-empty" role="status">{query ? 'Nenhuma conta corresponde à busca.' : 'Nenhuma conta cadastrada.'}</p>
                  ) : (
                    <ul className="owner-list">
                      {visibleUsers.map(user => {
                        const initials = user.name.trim().split(/\s+/).slice(0, 2).map(word => word[0]).join('').toLocaleUpperCase();
                        const region = user.regionId ? regionNames.get(user.regionId) : undefined;
                        const active = user.active !== false;
                        return (
                          <li className="owner-row" key={user.id} data-editing={editing?.id === user.id}>
                            <div className="owner-identity">
                              <span className="owner-initials" aria-hidden="true">{initials}</span>
                              <div>
                                <strong>{user.name}</strong>
                                <span className="owner-email">{user.email}</span>
                              </div>
                            </div>
                            <div className="owner-access">
                              <span>{roles[user.role]}</span>
                              {region && <span className="owner-region">{region}</span>}
                              <span className="owner-status" data-active={active}>{active ? 'Ativa' : 'Inativa'}</span>
                            </div>
                            <div className="owner-row-actions">
                              <button type="button" aria-label={'Editar ' + user.name} disabled={busy} onClick={() => openEditor(user)}>
                                <Pencil size={15} aria-hidden="true" /> Editar
                              </button>
                              <button type="button" className="owner-delete" aria-label={'Excluir ' + user.name} disabled={busy} onClick={() => void remove(user)}>
                                <Trash2 size={15} aria-hidden="true" /> Excluir
                              </button>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </section>

                <section className="owner-editor" aria-labelledby="owner-editor-title">
                  <div className="owner-editor-head">
                    <h2 id="owner-editor-title" tabIndex={-1} ref={editorTitle}>{editing ? 'Editar conta' : 'Nova conta'}</h2>
                    {editing && <span>{editing.name}</span>}
                  </div>

                  <form key={version} className="owner-form" onSubmit={save}>
                    <label>Nome<input name="name" required minLength={2} defaultValue={editing?.name} /></label>
                    <label>E-mail<input name="email" type="email" required defaultValue={editing?.email} /></label>
                    <div className="owner-form-grid">
                      <label>
                        <span id="owner-role-label">Perfil</span>
                        <select aria-labelledby="owner-role-label" value={role} onChange={event => setRole(event.target.value as RoleType)}>
                          {Object.entries(roles).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                        </select>
                      </label>
                      <label>
                        <span id="owner-region-label">Regional</span>
                        <select aria-labelledby="owner-region-label" name="region" disabled={role === 'global_admin'} required={['regional_coordinator', 'evangelism_leader', 'consolidation_team'].includes(role)} defaultValue={editing?.regionId ?? ''}>
                          <option value="">Sem regional</option>
                          {regions.map(region => <option key={region.id} value={region.id}>{region.name}</option>)}
                        </select>
                      </label>
                    </div>
                    <label>
                      {editing ? 'Nova senha (opcional)' : 'Senha inicial'}
                      <input name="password" type="password" autoComplete="new-password" required={!editing} minLength={8} />
                    </label>
                    {editing && <label className="owner-active"><input type="checkbox" name="active" defaultChecked={editing.active !== false} /> Conta ativa</label>}
                    <div className="owner-form-actions">
                      <button type="submit" className="owner-primary" disabled={busy}>{busy ? 'Salvando…' : editing ? 'Salvar alterações' : 'Criar conta'}</button>
                      {editing && <button type="button" disabled={busy} onClick={() => edit(null)}>Cancelar</button>}
                    </div>
                  </form>
                </section>
              </div>
              {notice && <p className="owner-feedback" data-error={Boolean(notice.error)} role={notice.error ? 'alert' : 'status'}>{notice.text}</p>}
            </>
          )}
        </div>
      ) : (
        <div className="owner-width owner-body"><p className="owner-load">Acesso exclusivo do proprietário. Saia para entrar com a conta autorizada.</p></div>
      )}
    </main>
  );
}
