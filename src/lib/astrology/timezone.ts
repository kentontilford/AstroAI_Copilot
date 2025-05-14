import { getZonedTime, findTimeZone } from 'timezone-support';

/**
 * Converts a local date and time to UTC date using the specified timezone
 * 
 * This function properly handles historical time changes, DST transitions,
 * and other timezone complexities that the native Date object doesn't handle well
 * 
 * @param dateString The date string in YYYY-MM-DD format
 * @param timeString The time string in HH:MM:SS format (local time)
 * @param timezone The IANA timezone identifier (e.g., 'America/New_York')
 * @returns Date object in UTC
 */
export function localDateTimeToUtc(
  dateString: string,
  timeString: string,
  timezone: string
): Date {
  try {
    // Get the timezone info
    const tz = findTimeZone(timezone);
    
    // Parse the date and time strings
    const [year, month, day] = dateString.split('-').map(Number);
    const [hours, minutes, seconds = 0] = timeString.split(':').map(Number);
    
    // Create a date object in the target timezone
    const localTime = {
      year,
      month: month, // timezone-support uses 1-based months
      day,
      hours,
      minutes,
      seconds,
      milliseconds: 0
    };
    
    // Convert to UTC using the timezone
    const utcTime = getZonedTime(localTime, tz);
    
    // Create a UTC date
    return new Date(Date.UTC(
      utcTime.year,
      utcTime.month - 1, // Back to 0-based months for JS Date
      utcTime.day,
      utcTime.hours,
      utcTime.minutes,
      utcTime.seconds,
      utcTime.milliseconds
    ));
  } catch (error) {
    console.error(`Error converting local time to UTC: ${error}`);
    throw new Error(`Failed to convert local time to UTC: ${error}`);
  }
}

/**
 * Calculates the Julian Day for a local date and time in a specific timezone
 * 
 * @param dateString The date string in YYYY-MM-DD format
 * @param timeString The time string in HH:MM:SS format (local time)
 * @param timezone The IANA timezone identifier (e.g., 'America/New_York')
 * @returns Julian Day as a number
 */
export function localDateTimeToJulianDay(
  dateString: string,
  timeString: string,
  timezone: string
): number {
  // Convert to UTC first
  const utcDate = localDateTimeToUtc(dateString, timeString, timezone);
  
  // Calculate Julian Day
  // Julian days start at noon, and the epoch is January 1, 4713 BCE
  return utcDate.getTime() / 86400000 + 2440587.5;
}

/**
 * Gets timezone information for a location
 * 
 * @param latitude Latitude in decimal degrees
 * @param longitude Longitude in decimal degrees
 * @returns IANA timezone identifier (e.g., 'America/New_York')
 */
export async function getTimezoneForLocation(
  latitude: number,
  longitude: number
): Promise<string> {
  try {
    // Call the Google Maps Timezone API
    // In production, you'd use an environment variable for the API key
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/timezone/json?location=${latitude},${longitude}&timestamp=${Math.floor(Date.now() / 1000)}&key=${process.env.GOOGLE_MAPS_API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch timezone: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.status !== 'OK') {
      throw new Error(`Timezone API error: ${data.status} ${data.errorMessage || ''}`);
    }
    
    return data.timeZoneId;
  } catch (error) {
    console.error(`Error getting timezone for location: ${error}`);
    // Fall back to UTC if timezone lookup fails
    return 'Etc/UTC';
  }
}

/**
 * Formats a date in local timezone
 * 
 * @param date The date to format
 * @param timezone The IANA timezone identifier
 * @returns Formatted date string
 */
export function formatDateInTimezone(
  date: Date, 
  timezone: string
): string {
  try {
    // Get the timezone info
    const tz = findTimeZone(timezone);
    
    // Create a formatted string
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: timezone,
      timeZoneName: 'short'
    } as Intl.DateTimeFormatOptions;
    
    return new Intl.DateTimeFormat('en-US', options).format(date);
  } catch (error) {
    console.error(`Error formatting date in timezone: ${error}`);
    // Fall back to UTC format if timezone formatting fails
    return date.toUTCString();
  }
}