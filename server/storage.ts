import type { User } from '../src/types/index.ts';
import { db, type DatabaseSchema } from './db.ts';
import { getSupabaseAdmin, isSupabaseConfigured } from './supabase.ts';

export type CollectionKey = keyof DatabaseSchema;

function clientFor(key: CollectionKey) {
  if (process.env.SUPABASE_ACCOUNTS_ONLY === 'true' && !['users', 'regions', 'audit_logs'].includes(key)) {
    return null;
  }
  return getSupabaseAdmin();
}

function convertRow(row: Record<string, unknown>, rename: (name: string) => string) {
  return Object.fromEntries(Object.entries(row).map(([name, value]) => [rename(name), value]));
}


/**
 * Unified storage gateway:
 * - Uses Supabase PostgreSQL when SUPABASE_URL & SUPABASE_SERVICE_ROLE_KEY are configured.
 * - Falls back to local JSON (server/db.ts) for local development & automated tests.
 */
export class StorageRepository {
  public isUsingSupabase(): boolean {
    return isSupabaseConfigured();
  }

  public async getAll<K extends CollectionKey>(key: K): Promise<DatabaseSchema[K]> {
    const supabase = clientFor(key);
    if (supabase) {
      const { data, error } = await supabase.from(key).select('*');
      if (error && (key === 'users' || (key === 'regions' && process.env.SUPABASE_ACCOUNTS_ONLY === 'true'))) {
        throw new Error('Falha ao consultar ' + key);
      }
      if (key==='users' && data) return data.map(row=>({
        id:row.id,name:row.name,email:row.email,role:row.role,active:row.active,
        regionId:row.region_id,departmentId:row.department_id,phone:row.phone,avatar:row.avatar,
        passwordHash:row.password_hash,authUserId:row.auth_user_id
      })) as DatabaseSchema[K];
      if (!error && Array.isArray(data)) {
        if (key === 'regions' || key === 'audit_logs') {
          return data.map(row => convertRow(row, name => name.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase()))) as unknown as DatabaseSchema[K];
        }
        return data as unknown as DatabaseSchema[K];
      }
      console.error(`[Supabase] Fallback local ao ler ${key}:`, error?.message);
    }
    return db.get(key);
  }

  public async saveAll<K extends CollectionKey>(key: K, value: DatabaseSchema[K]): Promise<void> {
    const supabase = clientFor(key);
    if (supabase) {
      if (Array.isArray(value) && value.length > 0) {
        const rows = value as unknown as Record<string, unknown>[];
        const { error } = await supabase.from(key).upsert(
          key === 'regions' ? rows.map(row => convertRow(row, name => name.replace(/[A-Z]/g, letter => '_' + letter.toLowerCase()))) : rows
        );
        if (error) {
          if (key === 'regions') throw new Error('Falha ao gravar regionais');
          console.error(`[Supabase] Erro ao sincronizar ${key}:`, error.message);
        }
      }
      return;
    }
    db.set(key, value);
  }

  public async writeUser(user:User, create:boolean) {
    const client=getSupabaseAdmin();
    if(client){
      const row={id:user.id,name:user.name,email:user.email,role:user.role,region_id:user.regionId??null,department_id:user.departmentId??null,phone:user.phone??null,active:user.active,password_hash:user.passwordHash};
      const query=create ? client.from('users').insert(row) : client.from('users').update(row).eq('id',user.id);
      const {error}=await query.select('id').single();
      if(error) throw new Error('Não foi possível gravar a conta.');
      return;
    }
    const users=db.get('users');
    if(users.some(u=>u.id!==user.id && u.email.toLowerCase()===user.email.toLowerCase())) throw new Error('E-mail já cadastrado');
    db.set('users',create?[...users,user]:users.map(u=>u.id===user.id?user:u));
  }

  public async deleteById(key: CollectionKey, id: string): Promise<void> {
    const supabase = clientFor(key);
    if (supabase) {
      const { error } = await supabase.from(key).delete().eq('id', id);
      if (error) {
        if(key==="users") throw new Error("Falha ao excluir a conta");
        console.error(`[Supabase] Erro ao excluir ${key}/${id}:`, error.message);
      }
      return;
    }
    const items = db.get(key) as Array<{ id: string }>;
    const filtered = items.filter((item) => item.id !== id);
    db.set(key, filtered as unknown as DatabaseSchema[typeof key]);
  }

  public async logAudit(
    userId: string,
    userName: string,
    action: string,
    targetEntity: string,
    targetId: string,
    details: string,
    regionId?: string
  ): Promise<void> {
    const supabase = getSupabaseAdmin();
    if (supabase) {
      const { error } = await supabase.from('audit_logs').insert({
        id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        timestamp: new Date().toISOString(),
        user_id: userId,
        user_name: userName,
        action,
        target_entity: targetEntity,
        target_id: targetId,
        details,
        region_id: regionId || null,
      });
      if (!error) return;
      console.error('[Supabase] Erro ao gravar audit_log:', error.message);
    }
    db.logAudit(userId, userName, action, targetEntity, targetId, details, regionId);
  }

  public async createSignedUploadUrl(
    bucket: string,
    filePath: string
  ): Promise<{ signedUrl: string; path: string } | null> {
    const supabase = getSupabaseAdmin();
    if (!supabase) return null;

    const { data, error } = await supabase.storage.from(bucket).createSignedUploadUrl(filePath);
    if (error || !data) {
      throw new Error(error?.message || 'Falha ao gerar URL de upload no Supabase Storage');
    }
    return { signedUrl: data.signedUrl, path: data.path };
  }
}

export const storage = new StorageRepository();
