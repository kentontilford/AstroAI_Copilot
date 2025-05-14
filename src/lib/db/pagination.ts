import { Prisma } from "@prisma/client";
import { excludeDeleted } from "./soft-delete";

/**
 * Standard pagination parameters
 */
export interface PaginationParams {
  /**
   * Page number (1-based)
   */
  page?: number;
  
  /**
   * Number of items per page
   */
  limit?: number;
  
  /**
   * Whether to include soft-deleted items
   */
  includeSoftDeleted?: boolean;
}

/**
 * Response format for paginated queries
 */
export interface PaginatedResponse<T> {
  /**
   * Array of items for the current page
   */
  items: T[];
  
  /**
   * Total number of items (across all pages)
   */
  total: number;
  
  /**
   * Current page number
   */
  page: number;
  
  /**
   * Number of items per page
   */
  limit: number;
  
  /**
   * Total number of pages
   */
  totalPages: number;
  
  /**
   * Whether there is a next page
   */
  hasNextPage: boolean;
  
  /**
   * Whether there is a previous page
   */
  hasPrevPage: boolean;
}

/**
 * Creates pagination parameters for Prisma queries
 */
export function createPaginationParams(params: PaginationParams = {}) {
  // Default values
  const page = Math.max(1, params.page || 1); // Minimum page is 1
  const limit = Math.min(100, Math.max(1, params.limit || 10)); // Between 1 and 100
  const offset = (page - 1) * limit;
  
  // Create params for count and data queries
  const skip = offset;
  const take = limit;
  
  // Filter out soft-deleted items unless specified
  const where = params.includeSoftDeleted ? {} : excludeDeleted();
  
  return {
    page,
    limit,
    offset,
    prismaParams: {
      skip,
      take,
      where,
    },
  };
}

/**
 * Generic function to get paginated results
 * 
 * @param model Prisma model to query
 * @param params Pagination parameters
 * @param additionalParams Additional Prisma query parameters
 */
export async function getPaginatedResults<T extends Prisma.ModelName>(
  model: T,
  params: PaginationParams = {},
  additionalParams: Partial<Prisma.Args<T, 'findMany'>> = {}
): Promise<PaginatedResponse<any>> {
  // @ts-ignore - Prisma typings are complex here
  const prismaModel = prisma[model.toLowerCase()];
  
  if (!prismaModel) {
    throw new Error(`Model ${model} not found`);
  }
  
  // Create pagination parameters
  const { page, limit, prismaParams } = createPaginationParams(params);
  
  // Combine with additional parameters
  const queryParams = {
    ...prismaParams,
    ...additionalParams,
  };
  
  // Create where condition that includes soft-deleted filter
  const where = {
    ...queryParams.where,
    ...(!params.includeSoftDeleted ? excludeDeleted() : {}),
  };
  
  // Run count and data queries in parallel
  const [total, items] = await Promise.all([
    // @ts-ignore
    prismaModel.count({ where }),
    // @ts-ignore
    prismaModel.findMany({
      ...queryParams,
      where,
    }),
  ]);
  
  // Calculate pagination metadata
  const totalPages = Math.ceil(total / limit);
  
  return {
    items,
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}