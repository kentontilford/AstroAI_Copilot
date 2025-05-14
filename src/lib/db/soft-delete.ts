import { prisma } from "./prisma";

/**
 * Soft deletes a record by setting the deleted_at field
 * 
 * @param tableName The table name as a Prisma model
 * @param id The ID of the record to delete
 * @param options Additional options for the delete operation
 * @returns The updated record
 */
export async function softDelete<T extends "User" | "BirthProfile" | "ChatThread">(
  tableName: T,
  id: string,
  options?: {
    /**
     * If true, will perform hard delete if soft delete fails
     */
    hardDeleteFallback?: boolean;
    
    /**
     * Additional fields to update along with deleted_at
     */
    additionalFields?: Record<string, unknown>;
  }
) {
  const { hardDeleteFallback = false, additionalFields = {} } = options || {};
  
  // Tables that support soft delete
  const softDeleteTables = ["User", "BirthProfile", "ChatThread"];
  
  // Check if table supports soft delete
  if (!softDeleteTables.includes(tableName)) {
    throw new Error(`Table ${tableName} does not support soft delete`);
  }
  
  try {
    // First attempt soft delete
    // @ts-ignore - Prisma typings are complex here, but this is fine for our use
    const result = await prisma[tableName.toLowerCase()].update({
      where: { id },
      data: {
        deleted_at: new Date(),
        ...additionalFields,
      },
    });
    
    return { success: true, result, type: "soft" as const };
  } catch (error) {
    // If soft delete fails and hard delete fallback is enabled
    if (hardDeleteFallback) {
      try {
        // @ts-ignore
        const result = await prisma[tableName.toLowerCase()].delete({
          where: { id },
        });
        
        return { success: true, result, type: "hard" as const };
      } catch (innerError) {
        return { 
          success: false, 
          error: innerError, 
          type: "hard" as const,
          message: "Failed to perform hard delete fallback"
        };
      }
    }
    
    return { 
      success: false, 
      error,
      type: "soft" as const,
      message: "Failed to perform soft delete"
    };
  }
}

/**
 * Query builder that excludes soft-deleted records
 */
export function excludeDeleted() {
  return {
    deleted_at: null,
  };
}

/**
 * Permanently delete soft-deleted records that are older than the specified days
 * 
 * @param tableName The table name as a Prisma model
 * @param olderThanDays Records deleted more than this many days ago will be permanently deleted
 */
export async function purgeDeletedRecords<T extends "User" | "BirthProfile" | "ChatThread">(
  tableName: T,
  olderThanDays: number = 30
) {
  // Calculate cutoff date
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
  
  try {
    // @ts-ignore - Prisma typings are complex here
    const result = await prisma[tableName.toLowerCase()].deleteMany({
      where: {
        deleted_at: {
          lt: cutoffDate,
          not: null,
        },
      },
    });
    
    return { 
      success: true, 
      count: result.count,
      message: `Successfully purged ${result.count} records from ${tableName}`
    };
  } catch (error) {
    return { 
      success: false, 
      error,
      message: `Failed to purge deleted records from ${tableName}`
    };
  }
}