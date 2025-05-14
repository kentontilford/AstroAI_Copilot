import NodeCache from 'node-cache';

// Create a singleton cache instance with default TTL of 1 hour
// stdTTL is in seconds: 3600 = 1 hour
const cache = new NodeCache({ 
  stdTTL: 3600,
  checkperiod: 120, // Check for expired keys every 2 minutes
  useClones: false // Store/retrieve references to the objects (improved performance)
});

export { cache };

/**
 * Generic function to get cached data or compute and cache it if not present
 */
export async function getCachedData<T>(
  key: string,
  computeFunction: () => Promise<T>,
  options?: { 
    /**
     * Time to live in seconds
     */
    ttl?: number;
    
    /**
     * Whether to bypass cache and force recomputation
     */
    forceRefresh?: boolean;
  }
): Promise<T> {
  const { ttl, forceRefresh = false } = options || {};
  
  // If force refresh is true, skip cache lookup
  if (!forceRefresh) {
    // Check if data is in cache
    const cachedData = cache.get<T>(key);
    if (cachedData !== undefined) {
      return cachedData;
    }
  }
  
  // If not in cache or force refresh, compute data
  const data = await computeFunction();
  
  // Cache the computed data
  cache.set(key, data, ttl);
  
  return data;
}

/**
 * Cache with namespaces to group related cache entries
 */
export class NamespacedCache {
  private namespace: string;
  
  constructor(namespace: string) {
    this.namespace = namespace;
  }
  
  /**
   * Create a key with the namespace prefix
   */
  private createKey(key: string): string {
    return `${this.namespace}:${key}`;
  }
  
  /**
   * Get a cached value
   */
  get<T>(key: string): T | undefined {
    return cache.get<T>(this.createKey(key));
  }
  
  /**
   * Set a cached value
   */
  set<T>(key: string, value: T, ttl?: number): boolean {
    return cache.set(this.createKey(key), value, ttl);
  }
  
  /**
   * Delete a cached value
   */
  del(key: string): number {
    return cache.del(this.createKey(key));
  }
  
  /**
   * Flush all keys in this namespace
   */
  flush(): void {
    const keys = cache.keys().filter(k => k.startsWith(`${this.namespace}:`));
    cache.del(keys);
  }
  
  /**
   * Get cached data or compute and cache it if not present
   */
  async getOrCompute<T>(
    key: string,
    computeFunction: () => Promise<T>,
    options?: { ttl?: number; forceRefresh?: boolean }
  ): Promise<T> {
    return getCachedData(this.createKey(key), computeFunction, options);
  }
}

// Specific caches for different parts of the application
export const astrologyCache = new NamespacedCache('astrology');
export const openaiCache = new NamespacedCache('openai');
export const userDataCache = new NamespacedCache('userdata');