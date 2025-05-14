# Astrology Calculation System Documentation

## Overview

This document provides an overview of the astrology calculation system used in the Astrology AI Copilot application. The system uses the Swiss Ephemeris library to perform accurate astronomical calculations for creating natal charts, transit charts, and relationship composite charts.

## Core Components

### 1. Swiss Ephemeris Integration

The system uses the `swisseph` library, which is a Node.js binding for the Swiss Ephemeris, a high-precision ephemeris based on the DE431 astronomical model from NASA's Jet Propulsion Laboratory. Our implementation:

- Sets up ephemeris files in the `public/ephe` directory
- Provides functions to calculate planetary positions, house cusps, and special points
- Supports various house systems (with Whole Sign as the default)
- Handles proper timezone conversions for accurate birth chart calculation

### 2. Chart Types

The system can calculate several types of astrological charts:

1. **Natal Charts**: Birth charts calculated based on a person's birth date, time, and location
2. **Transit Charts**: Current planetary positions at a specified date and time
3. **Composite Charts**: Relationship charts calculated by finding the midpoints between two people's charts

### 3. House Systems

The system supports multiple house systems, including:

- Whole Sign (default): Houses correspond exactly to zodiac signs
- Placidus: Time-based house system that divides the ecliptic unequally
- Equal: Equal division of the ecliptic starting from the Ascendant
- Other systems (Koch, Campanus, Regiomontanus, etc.)

## Technical Implementation

### Data Models

1. **Point Position**: Represents a celestial body's position with longitude, latitude, distance, and speed
2. **Formatted Point**: Client-friendly representation of a point with sign, degrees, and house placement
3. **House Cusp**: Represents the beginning of an astrological house
4. **Chart Angles**: Contains special chart points like Ascendant, Midheaven, etc.
5. **Aspect**: Represents an angular relationship between two points

### Key Calculations

1. **Planetary Positions**: Calculated using `swe_calc_ut` function from Swiss Ephemeris
2. **House Cusps**: Calculated using `swe_houses` and `swe_houses_ex` functions
3. **Aspects**: Calculated by finding angular relationships between points
4. **Composite Charts**: Calculated by finding midpoints between corresponding points in two charts

### Timezone Handling

The system uses the `timezone-support` library to accurately convert local birth times to UTC for calculation:

- Properly handles historical timezone changes and DST transitions
- Falls back to UTC if timezone information is unavailable
- Converts Julian Day Numbers correctly for ephemeris calculations

### Caching System

To improve performance and reduce redundant calculations:

- Birth charts are cached for 1 week (they don't change)
- Transit charts are cached for 1 hour (they change slowly)
- Composite charts are cached for 1 week
- Each calculation has a unique cache key based on all input parameters

## Astrological Features

### 1. Planetary Placements

For each planet (and other points), the system calculates:

- Zodiac sign placement
- Degree and minute within the sign
- House placement
- Retrograde status
- Dignities and debilities (rulership, exaltation, detriment, fall)

### 2. House Placements

For each house, the system provides:

- Zodiac sign placement
- Starting degree within the sign
- Planetary occupants

### 3. Chart Angles

Special chart angles are calculated:

- Ascendant (Rising Sign): The eastern horizon point
- Midheaven (MC): The highest point in the chart
- Descendant: The western horizon point (opposite Ascendant)
- Imum Coeli (IC): The lowest point (opposite Midheaven)

### 4. Aspects

Angular relationships between planets are calculated with:

- Aspect type (conjunction, opposition, trine, square, sextile, etc.)
- Orb (allowed deviation from exact aspect)
- Applying/separating status
- Aspect strength/importance ranking

## Usage

### Calculating a Natal Chart

```typescript
const birthChart = await calculateNatalChart({
  date_of_birth: '1990-01-15',          // YYYY-MM-DD format
  time_of_birth: '14:30:00',            // HH:MM:SS format (local time)
  is_time_unknown: false,
  latitude: 40.7128,                    // Decimal degrees (positive = North)
  longitude: -74.0060,                  // Decimal degrees (positive = East)
  timezone: 'America/New_York',         // IANA timezone identifier
});
```

### Calculating Current Transits

```typescript
const currentTransits = await calculateTransits();
```

### Calculating a Composite Chart

```typescript
const compositeChart = await calculateCompositeChart(
  personABirthData,
  personBBirthData
);
```

## Accuracy Considerations

1. **Birth Time**: Accuracy is significantly affected by birth time precision
2. **Unknown Birth Time**: Default noon time is used if birth time is unknown
3. **Historical Timezones**: Special care is taken for accurate timezone conversion
4. **House System**: Different house systems can produce different results
5. **Astronomical Model**: Uses the latest DE431 ephemeris from NASA/JPL

## Future Improvements

1. **Additional Chart Types**: Synastry, solar returns, progressions
2. **Additional Calculation Methods**: Harmonics, midpoints, Arabic parts
3. **Vedic/Sidereal Support**: Adding Vedic astrology calculations
4. **Chart Rectification**: Methods to estimate unknown birth times
5. **3D Visualizations**: Interactive charts with 3D celestial representation

## References

1. Swiss Ephemeris documentation: https://www.astro.com/swisseph/
2. Astrological house systems: http://www.astrology.com/house-systems
3. Astronomical calculations: NASA JPL DE431 reference
4. Timezone database: https://github.com/moment/moment-timezone