import { db, type DatabaseSchema } from './db.ts';
import { getSupabaseAdmin, isSupabaseConfigured } from './supabase.ts';

export type CollectionKey = keyof DatabaseSchema;

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
    const supabase = getSupabaseAdmin();
    if (supabase) {
      const { data, error } = await supabase.from(key).select('*');
      if (!error && Array.isArray(data)) {
        return data as unknown as DatabaseSchema[K];
      }
      console.error(`[Supabase] Fallback local ao ler ${key}:`, error?.message);
    }
    return db.get(key);
  }

  public async saveAll<K extends CollectionKey>(key: K, value: DatabaseSchema[K]): Promise<void> {
    const supabase = getSupabaseAdmin();
    if (supabase) {
      if (Array.isArray(value) && value.length > 0) {
        const { error } = await supabase.from(key).upsert(value as unknown as Record<string, unknown>[]);
        if (error) {
          console.error(`[Supabase] Erro ao sincronizar ${key}:`, error.message);
        }
      }
      return;
    }
    db.set(key, value);
  }

  public async deleteById(key: CollectionKey, id: string): Promise<void> {
    const supabase = getSupabaseAdmin();
    if (supabase) {
      const { error } = await supabase.from(key).delete().eq('id', id);
      if (error) {
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
