import { z } from 'zod';

/**
 * Base schema for validating geographical coordinates
 */
export const geographicCoordinatesSchema = z.object({
  latitude: z.number()
    .min(-90, "Latitude must be between -90 and 90 degrees")
    .max(90, "Latitude must be between -90 and 90 degrees"),
  longitude: z.number()
    .min(-180, "Longitude must be between -180 and 180 degrees")
    .max(180, "Longitude must be between -180 and 180 degrees"),
});

/**
 * Schema for validating birth data
 */
export const birthDataSchema = z.object({
  profile_name: z.string()
    .min(1, "Profile name is required")
    .max(100, "Profile name must be less than 100 characters"),
  date_of_birth: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date of birth must be in YYYY-MM-DD format"),
  time_of_birth: z.string()
    .regex(/^\d{2}:\d{2}(:\d{2})?$/, "Time of birth must be in HH:MM or HH:MM:SS format")
    .optional(),
  is_time_unknown: z.boolean().default(false),
  birth_city_name: z.string()
    .min(1, "Birth city name is required"),
  birth_latitude: z.number()
    .min(-90, "Latitude must be between -90 and 90 degrees")
    .max(90, "Latitude must be between -90 and 90 degrees"),
  birth_longitude: z.number()
    .min(-180, "Longitude must be between -180 and 180 degrees")
    .max(180, "Longitude must be between -180 and 180 degrees"),
  birth_timezone: z.string()
    .min(1, "Birth timezone is required"),
});

/**
 * Schema for validating dashboard requests
 */
export const dashboardRequestSchema = z.object({
  type: z.enum(['personal_growth', 'relationships'], {
    errorMap: () => ({ message: "Type must be either 'personal_growth' or 'relationships'" }),
  }),
});

/**
 * Schema for validating chart calculation requests
 */
export const calculateChartRequestSchema = z.object({
  chart_type: z.enum(['natal', 'transit', 'composite'], {
    errorMap: () => ({ message: "Chart type must be one of: natal, transit, composite" }),
  }),
  birth_data: birthDataSchema.optional(),
  second_birth_data: birthDataSchema.optional(),
  transit_date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Transit date must be in YYYY-MM-DD format")
    .optional(),
}).refine(data => {
  if (data.chart_type === 'natal' && !data.birth_data) {
    return false;
  }
  if (data.chart_type === 'composite' && (!data.birth_data || !data.second_birth_data)) {
    return false;
  }
  return true;
}, {
  message: "Birth data is required for natal and composite charts. Second birth data is required for composite charts.",
  path: ['birth_data'],
});

/**
 * Schema for validating chat messages
 */
export const chatMessageSchema = z.object({
  thread_id: z.string().uuid().optional(),
  user_message: z.string()
    .min(1, "Message cannot be empty")
    .max(4000, "Message is too long (max 4000 characters)"),
  chart_context_enabled: z.boolean().default(false),
  active_dashboard_type: z.enum(['personal_growth', 'relationships']).optional(),
});

/**
 * Schema for validating Stripe checkout session creation
 */
export const createCheckoutSessionSchema = z.object({
  success_url: z.string().url("Success URL must be valid"),
  cancel_url: z.string().url("Cancel URL must be valid"),
  lookup_key: z.string().min(1, "Lookup key is required"),
});

/**
 * Schema for validating UUID parameters
 */
export const uuidParamSchema = z.object({
  id: z.string().uuid("Invalid UUID format"),
});

/**
 * Utility function to validate and parse request data
 */
export async function validateRequest<T>(
  req: Request,
  schema: z.ZodSchema<T>
): Promise<{ success: true; data: T } | { success: false; error: string }> {
  try {
    const body = await req.json();
    const data = schema.parse(body);
    return { success: true, data };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', '),
      };
    }
    return { success: false, error: 'Invalid request data' };
  }
}

/**
 * Utility function to validate query parameters
 */
export function validateQueryParams<T>(
  params: URLSearchParams,
  schema: z.ZodSchema<T>
): { success: true; data: T } | { success: false; error: string } {
  // Convert URLSearchParams to object
  const paramObject: Record<string, string> = {};
  params.forEach((value, key) => {
    paramObject[key] = value;
  });

  try {
    const data = schema.parse(paramObject);
    return { success: true, data };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', '),
      };
    }
    return { success: false, error: 'Invalid query parameters' };
  }
}