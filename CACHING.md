# Caching Strategy

This document outlines the caching strategy implemented in the Astrology AI Copilot application to improve performance and reduce costs.

## Types of Caching

The application implements several levels of caching:

1. **Astrological Calculation Caching**: Caches expensive Swiss Ephemeris calculations
2. **OpenAI API Response Caching**: Reduces API calls for similar astrological interpretations
3. **Database Query Caching**: Optimizes data access patterns and reduces round trips

## Cache Implementation

We use a two-tiered caching approach:

1. **In-memory Caching**: Fast, local caching for the duration of the server's lifetime
   - Implemented with `node-cache`
   - Different TTLs (Time To Live) based on data type

2. **Future Database Caching**: For deployments across multiple instances
   - Planned Redis or database-backed caching for distributed environments

## Cache Namespaces

To organize cache entries, we've implemented namespaced caches:

```typescript
// Specific caches for different parts of the application
export const astrologyCache = new NamespacedCache('astrology');
export const openaiCache = new NamespacedCache('openai');
export const userDataCache = new NamespacedCache('userdata');
```

## Cache TTLs by Data Type

Different data types have different caching policies:

| Data Type            | Cache Duration | Reason                                     |
|----------------------|----------------|-------------------------------------------|
| Natal Chart          | 1 week         | Static data that never changes             |
| Composite Chart      | 1 week         | Static relationship data                   |
| Transit Calculations | 1 hour         | Planetary positions change gradually       |
| Birth Chart Insights | 1 week         | Interpretations of static data             |
| Transit Insights     | 12 hours       | Transits change daily                      |
| Favorability Ratings | 12 hours       | Depends on transits                        |

## Cache Keys

We use structured cache keys to ensure uniqueness and allow for selective invalidation:

### Astrological Calculations

```
natal:${date_of_birth}:${time_of_birth}:${latitude}:${longitude}:${timezone}
transits:${rounded_date_iso}
composite:${profile_a_data}:${profile_b_data}
```

### OpenAI AI Responses

```
insight:${type}:${chart_hash}:${transit_hash}:${composite_hash}:${date}
favorability:${area}:${chart_hash}:${composite_hash}:${date}
```

## Performance Improvements

The implemented caching provides several benefits:

1. **Reduced Latency**: Most dashboard requests resolve in milliseconds after first load
2. **Lower API Costs**: Significantly reduces OpenAI API calls (can be >90% reduction)
3. **Improved Scalability**: Servers can handle more concurrent users
4. **Reduced Calculation Load**: Ephemeris calculations are computationally expensive

## Cache Invalidation

Cache entries are automatically invalidated based on their TTL. Manual invalidation can be performed if needed:

```typescript
// Invalidate a specific cache entry
astrologyCache.del('transits:2023-05-13T00:00:00.000Z');

// Flush an entire cache namespace
openaiCache.flush();
```

## Future Cache Enhancements

Planned enhancements to the caching system:

1. **Distributed Caching**: Redis-backed caching for multi-server deployments
2. **Cache Warmup**: Pre-calculate common transits during off-peak hours
3. **Smart Invalidation**: Invalidate only affected cache entries when data changes
4. **Cache Analytics**: Monitor cache hit/miss rates for optimization