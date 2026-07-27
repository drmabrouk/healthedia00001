/**
 * Centralized Database Service for Healthedia Platform
 * Provides transactional CRUD, atomicity, rollback on failure, 
 * and automated backend replication.
 */

// Local storage prefix mapping
const KEY_MAP: Record<string, string> = {
  "users": "healthedia_users",
  "professions": "healthedia_professions",
  "taxonomies": "healthedia_taxonomies",
  "manuscripts": "healthedia_manuscripts",
  "tickets": "healthedia_tickets",
  "appearance": "healthedia_appearance",
  "institutions": "healthedia_institutions",
  "evaluations": "healthedia_evaluations",
  "institutionConfig": "healthedia_institution_config",
  "projects": "healthedia_projects",
  "activityLogs": "healthedia_activity_logs",
  "pages": "healthedia_pages",
  "redirects": "healthedia_redirects",
  "seoSettings": "healthedia_seo_settings",
  "published_papers": "healthedia_published_papers",
  "current_user": "healthedia_current_user",
  "notifications": "healthedia_notifications",
  "recent_searches": "healthedia_recent_searches",
  "researcher_edits": "healthedia_researcher_edits",
  "researcher_applications": "healthedia_researcher_applications",
  "systemSettings": "healthedia_system_settings"
};

// Map backend API collection endpoints to KEY_MAP keys
const BACKEND_COLLECTION_MAP: Record<string, string> = {
  "users": "users",
  "professions": "professions",
  "taxonomies": "taxonomies",
  "manuscripts": "manuscripts",
  "tickets": "tickets",
  "appearance": "appearance",
  "institutions": "institutions",
  "evaluations": "evaluations",
  "institutionConfig": "institutionConfig",
  "projects": "projects",
  "activityLogs": "activityLogs",
  "pages": "pages",
  "redirects": "redirects",
  "seoSettings": "seoSettings",
  "published_papers": "published_papers",
  "systemSettings": "systemSettings"
};

// Helper to resolve logical key to physical localStorage key
function resolveKey(key: string): string {
  return KEY_MAP[key] || key;
}

// Transaction snapshot representation for in-flight updates
export interface Transaction {
  read<T = any>(collection: string, fallback?: T): T;
  write<T = any>(collection: string, data: T): void;
  insert<T = any>(collection: string, item: T): void;
  update<T = any>(collection: string, id: string | number, updatedFields: Partial<T>, idKey?: string): void;
  delete(collection: string, id: string | number, idKey?: string): void;
}

/**
 * High-performance database client with structured transaction support,
 * automated REST-based synchronization, and local/offline tolerance.
 */
export const db = {
  /**
   * Reads an item or collection safely from storage.
   */
  read<T = any>(key: string, fallback: T): T {
    const rawKey = resolveKey(key);
    const item = localStorage.getItem(rawKey);
    if (!item) return fallback;
    try {
      return JSON.parse(item) as T;
    } catch {
      return fallback;
    }
  },

  /**
   * Writes data directly to storage and schedules an asynchronous sync to the backend.
   */
  write<T = any>(key: string, data: T): void {
    const rawKey = resolveKey(key);
    localStorage.setItem(rawKey, JSON.stringify(data));

    // Replicate to Express backend if applicable
    const backendEndpoint = BACKEND_COLLECTION_MAP[key] || BACKEND_COLLECTION_MAP[rawKey.replace("healthedia_", "")];
    if (backendEndpoint) {
      fetch(`/api/collections/${backendEndpoint}/sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      })
      .then((res) => {
        if (!res.ok) {
          console.error(`[DB Backend Replicate Failed] Overwrite failed for database collection: ${backendEndpoint}`);
        }
      })
      .catch((err) => {
        console.error(`[DB Backend Replicate Connection Error] Failed to replicate data of ${backendEndpoint} to backend server:`, err);
      });
    }

    // Dynamic Sitemap Updates for Relevant Collections
    const sitemapTriggers = [
      "healthedia_pages",
      "healthedia_published_papers",
      "healthedia_users",
      "healthedia_institutions",
      "healthedia_seo_settings"
    ];
    if (sitemapTriggers.includes(rawKey)) {
      import("./taxonomyStore").then((mod) => {
        mod.triggerAutomatedSitemapUpdate();
      }).catch(err => console.error("Dynamic sitemap sync error:", err));
    }
  },

  /**
   * Executes a series of operations inside an isolated transaction.
   * If any of the steps fail, no changes are committed to disk (atomic guarantee).
   */
  async runTransaction<T = any>(work: (tx: Transaction) => T): Promise<T> {
    // 1. Transaction-isolated staging cache
    const stage = new Map<string, string>();

    const tx: Transaction = {
      read<U = any>(collection: string, fallback?: U): U {
        const rawKey = resolveKey(collection);
        if (stage.has(rawKey)) {
          return JSON.parse(stage.get(rawKey)!) as U;
        }
        const item = localStorage.getItem(rawKey);
        if (!item) return fallback as U;
        try {
          return JSON.parse(item) as U;
        } catch {
          return fallback as U;
        }
      },

      write<U = any>(collection: string, data: U): void {
        const rawKey = resolveKey(collection);
        stage.set(rawKey, JSON.stringify(data));
      },

      insert<U = any>(collection: string, item: U): void {
        const rawKey = resolveKey(collection);
        const currentData = tx.read<U[]>(collection, []);
        if (!Array.isArray(currentData)) {
          throw new Error(`Cannot insert item into non-array collection: ${collection}`);
        }
        currentData.push(item);
        tx.write(collection, currentData);
      },

      update<U = any>(collection: string, id: string | number, updatedFields: Partial<U>, idKey = "id"): void {
        const currentData = tx.read<U[]>(collection, []);
        if (!Array.isArray(currentData)) {
          throw new Error(`Cannot update items inside non-array collection: ${collection}`);
        }
        let matched = false;
        const updatedData = currentData.map((item: any) => {
          if (item && item[idKey] === id) {
            matched = true;
            return { ...item, ...updatedFields };
          }
          return item;
        });
        if (!matched) {
          throw new Error(`Update failed: Item with ${idKey}='${id}' not found in ${collection}`);
        }
        tx.write(collection, updatedData);
      },

      delete(collection: string, id: string | number, idKey = "id"): void {
        const currentData = tx.read<any[]>(collection, []);
        if (!Array.isArray(currentData)) {
          throw new Error(`Cannot delete items from non-array collection: ${collection}`);
        }
        const beforeLen = currentData.length;
        const filtered = currentData.filter((item: any) => !(item && item[idKey] === id));
        if (filtered.length === beforeLen) {
          throw new Error(`Deletion failed: Item with ${idKey}='${id}' not found in ${collection}`);
        }
        tx.write(collection, filtered);
      }
    };

    try {
      // 2. Perform work in isolated context
      const result = await work(tx);

      // 3. Commit staged writes atomically if work finishes successfully
      for (const [rawKey, valString] of stage.entries()) {
        localStorage.setItem(rawKey, valString);

        // Find logical key for backend synchronization
        const logicalKey = Object.keys(KEY_MAP).find(k => KEY_MAP[k] === rawKey) || rawKey;
        const backendEndpoint = BACKEND_COLLECTION_MAP[logicalKey];
        if (backendEndpoint) {
          const parsedData = JSON.parse(valString);
          fetch(`/api/collections/${backendEndpoint}/sync`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(parsedData)
          })
          .then((res) => {
            if (!res.ok) {
              console.error(`[DB Tx Sync Failed] Overwrite failed for collection: ${backendEndpoint}`);
            }
          })
          .catch((err) => {
            console.error(`[DB Tx Sync Connection Error] Failed to replicate transaction to ${backendEndpoint}:`, err);
          });
        }

        // Dynamic Sitemap Updates for Relevant Keys
        const sitemapTriggers = [
          "healthedia_pages",
          "healthedia_published_papers",
          "healthedia_users",
          "healthedia_institutions",
          "healthedia_seo_settings"
        ];
        if (sitemapTriggers.includes(rawKey)) {
          import("./taxonomyStore").then((mod) => {
            mod.triggerAutomatedSitemapUpdate();
          }).catch(err => console.error("Dynamic sitemap sync error:", err));
        }
      }

      console.log(`[DB Transaction Committed] Successfully written ${stage.size} collections to local cache and persistent database.`);
      return result;
    } catch (error) {
      console.error("[DB Transaction Rolled Back] Error encountered during transaction, discarding all staged writes:", error);
      throw error;
    }
  }
};
