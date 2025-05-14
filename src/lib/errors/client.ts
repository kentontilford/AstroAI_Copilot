/**
 * Client-side error handling utilities
 */
import { toast } from '@/components/ui/use-toast';

interface ApiErrorResponse {
  error: string;
  code?: string;
  details?: unknown;
}

/**
 * Handle API errors in a consistent way on the client
 */
export async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    return handleApiError(response);
  }

  try {
    return await response.json() as T;
  } catch (error) {
    console.error('Error parsing API response', error);
    throw new Error('Failed to parse API response');
  }
}

/**
 * Extract and throw appropriate error information from an API error response
 */
async function handleApiError(response: Response): Promise<never> {
  let errorData: ApiErrorResponse;
  
  try {
    errorData = await response.json() as ApiErrorResponse;
  } catch (error) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  const error = new Error(errorData.error || `API error: ${response.status} ${response.statusText}`);
  (error as any).code = errorData.code || `http_${response.status}`;
  (error as any).details = errorData.details;
  (error as any).status = response.status;
  
  throw error;
}

/**
 * Show appropriate user-friendly error messages based on API errors
 */
export function showErrorToast(error: unknown): void {
  let title = 'An error occurred';
  let description = 'Please try again later';

  if (error instanceof Error) {
    // For custom errors with code property
    const errorCode = (error as any).code;
    
    if (errorCode === 'auth_error' || errorCode === 'unauthorized' || (error as any).status === 401) {
      title = 'Authentication Error';
      description = 'Please sign in to continue';
    } else if (errorCode === 'subscription_required' || (error as any).status === 402) {
      title = 'Subscription Required';
      description = 'This feature requires a subscription';
    } else if (errorCode === 'not_found' || (error as any).status === 404) {
      title = 'Not Found';
      description = 'The requested resource could not be found';
    } else if (errorCode === 'rate_limit_exceeded' || (error as any).status === 429) {
      title = 'Rate Limit Exceeded';
      description = 'Please try again later';
    } else if (errorCode === 'validation_error' || (error as any).status === 400) {
      title = 'Invalid Input';
      description = error.message || 'Please check your input';
    } else {
      // Use the error message if available
      description = error.message || description;
    }
  }

  toast({
    variant: 'destructive',
    title,
    description,
  });
}

/**
 * Handle API errors and show appropriate toast
 */
export function handleApiError(error: unknown): void {
  console.error('API Error:', error);
  showErrorToast(error);
}