/**
 * Types for astrological calculations
 */

// Available house systems
export enum HouseSystem {
  PLACIDUS = 'P', // Placidus
  KOCH = 'K',     // Koch
  PORPHYRY = 'O', // Porphyry
  REGIOMONTANUS = 'R', // Regiomontanus
  CAMPANUS = 'C', // Campanus
  EQUAL = 'E',    // Equal houses
  WHOLE_SIGN = 'W', // Whole sign houses
  MERIDIAN = 'X', // Meridian houses
  MORINUS = 'M',  // Morinus
  ALCABITIUS = 'B', // Alcabitius
  TOPOCENTRIC = 'T', // Topocentric
  KRUSINSKI = 'U', // Krusinski
  APC = 'A',      // Astrological Quadrants
  EQUAL_MC = 'L', // Equal with MC as 10th
  EQUAL_ANOM = 'Q', // Equal with Anaretic Projection (Rudhyar)
  SRIPATI = 'S',  // Sripati houses (Hindu)
  SUNSHINE = 'I', // Sunshine houses
  VERTEX = 'V',   // Vertex houses
}

// Astrological points (planets, asteroids, etc.)
export type AstrologicalPoint = {
  id: number;       // Swiss Ephemeris ID
  name: string;     // Name of the point
  type: 'planet' | 'node' | 'asteroid' | 'angle' | 'lot' | 'fixed_star'; // Type of point
  glyph: string;    // Unicode glyph/symbol
};

// Zodiac signs
export type ZodiacSign = {
  id: number;        // 0-11 for Aries to Pisces
  name: string;      // Sign name
  glyph: string;     // Unicode glyph/symbol
  element: 'fire' | 'earth' | 'air' | 'water';
  modality: 'cardinal' | 'fixed' | 'mutable';
  ruler: number;     // Traditional ruler (planet ID)
  modern_ruler?: number; // Modern ruler (planet ID), if different
  exaltation?: number; // Exalted planet
  fall?: number;     // Planet in fall
  detriment?: number; // Planet in detriment
};

// Aspect types
export enum AspectType {
  CONJUNCTION = 'conjunction',
  OPPOSITION = 'opposition',
  TRINE = 'trine',
  SQUARE = 'square',
  SEXTILE = 'sextile',
  SEMI_SEXTILE = 'semi_sextile',
  SEMI_SQUARE = 'semi_square',
  SESQUI_SQUARE = 'sesqui_square',
  QUINTILE = 'quintile',
  BI_QUINTILE = 'bi_quintile',
  QUINCUNX = 'quincunx', // Inconjunct
  PARALLEL = 'parallel',
  CONTRA_PARALLEL = 'contra_parallel',
}

// Aspect definition
export type AspectDefinition = {
  type: AspectType;
  angle: number;
  orb: number;
  harmony: 'harmonious' | 'disharmonious' | 'neutral';
  power: number; // 1-10 scale of aspect strength/importance
};

// Aspect between two points
export type Aspect = {
  point1: string; // Point name
  point2: string; // Point name
  type: AspectType;
  angle: number;  // Exact angle
  orb: number;    // Orb in degrees
  applying: boolean; // Whether aspect is applying or separating
  exactness: number; // 0-1 scale, 1 being exact
};

// Point position
export type PointPosition = {
  longitude: number;
  latitude: number;
  distance: number;
  longitudeSpeed: number;
  latitudeSpeed: number;
  distanceSpeed: number;
};

// Formatted point for client
export type FormattedPoint = {
  name: string;
  sign: string;
  sign_glyph: string;
  degree: number;
  minute: number;
  full_degree: number;
  house?: number;
  retrograde?: boolean;
};

// House cusp
export type HouseCusp = {
  house_number: number;
  sign: string;
  sign_glyph: string;
  start_degree_in_sign: number;
  absolute_degree: number;
};

// Chart angles
export type ChartAngles = {
  ascendant: {
    sign: string;
    sign_glyph: string;
    full_degree: number;
  };
  midheaven: {
    sign: string;
    sign_glyph: string;
    full_degree: number;
  };
  descendant?: {
    sign: string;
    sign_glyph: string;
    full_degree: number;
  };
  imum_coeli?: {
    sign: string;
    sign_glyph: string;
    full_degree: number;
  };
};

// Birth data for chart calculation
export type BirthData = {
  date_of_birth: string; // YYYY-MM-DD
  time_of_birth?: string; // HH:MM:SS in local time
  is_time_unknown: boolean;
  latitude: number;
  longitude: number;
  timezone: string; // IANA timezone identifier
  location_name?: string; // Optional human-readable location
};

// Natal chart data
export type NatalChart = {
  calculation_type: 'natal';
  points: FormattedPoint[];
  houses: HouseCusp[];
  ascendant: ChartAngles['ascendant'];
  midheaven: ChartAngles['midheaven'];
  time_unknown_applied: boolean;
  aspects?: Aspect[];
};

// Transit chart data
export type TransitChart = {
  calculation_type: 'transits';
  points: FormattedPoint[];
  date: string;
  aspects?: Aspect[]; // Aspects to natal chart if provided
};

// Composite chart data
export type CompositeChart = {
  calculation_type: 'composite';
  points: FormattedPoint[];
  houses: HouseCusp[];
  ascendant: ChartAngles['ascendant'];
  midheaven: ChartAngles['midheaven'];
  aspects?: Aspect[];
};

// Synastry data
export type SynastryData = {
  calculation_type: 'synastry';
  person1_points: FormattedPoint[];
  person2_points: FormattedPoint[];
  person1_chart: NatalChart;
  person2_chart: NatalChart;
  synastry_aspects: Aspect[];
};

// Chart calculation options
export type ChartCalculationOptions = {
  house_system?: HouseSystem;
  with_aspects?: boolean;
  points_to_include?: string[]; // Array of point names to include
  aspects_to_include?: AspectType[]; // Array of aspect types to include
  custom_orbs?: {
    [key in AspectType]?: number;
  };
  secondary_progressed_date?: string; // For secondary progressed charts
};