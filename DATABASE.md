# Database Management

This document provides information about the database structure, migrations, and management tools for the Astrology AI Copilot application.

## Database Schema

The application uses PostgreSQL as the database with Prisma ORM. The main models are:

- **User**: Stores user information and subscription details
- **BirthProfile**: Stores birth profile information for astrological calculations
- **ChatThread**: Manages conversation threads with the AI assistant
- **ChatMessage**: Stores individual messages in chat threads

## Features

- **Enum Types**: We use proper Postgres enum types for subscription status, dashboard types, and message roles
- **Pagination**: Built-in support for paginated database queries
- **Soft Delete**: All major entities support soft deletion for data recovery
- **Indexing**: Optimized indexes on frequently queried fields
- **Constraints**: Validation constraints on geographical coordinates

## Database Commands

```bash
# Development workflow
npm run db:studio           # Launch Prisma Studio to view/edit data
npm run db:generate         # Generate Prisma client after schema changes
npm run db:push             # Push schema changes to database (dev only)
npm run db:migrate:dry      # Create migration files without applying
npm run db:migrate:dev      # Create and apply migrations

# Production workflow
npm run db:migrate:prod     # Apply migrations in production
```

## Safe Migrations

We use a structured migration approach:

1. Make changes to `schema.prisma`
2. Run `npm run db:migrate:dry --name=your_migration_name` to create migration files
3. Review the generated SQL in `prisma/migrations`
4. Apply the migration with `npm run db:migrate:dev`

## Working with Soft Delete

To support data recovery and regulatory compliance, we implement soft delete:

```typescript
// Soft delete a record
import { softDelete } from '@/lib/db/soft-delete';

await softDelete('User', userId);

// Exclude deleted records in queries
import { excludeDeleted } from '@/lib/db/soft-delete';

await prisma.user.findMany({
  where: {
    ...excludeDeleted(),
    // other conditions...
  }
});

// Purge old soft-deleted records
import { purgeDeletedRecords } from '@/lib/db/soft-delete';

await purgeDeletedRecords('User', 30); // 30 days
```

## Pagination

We provide pagination utilities for API endpoints:

```typescript
import { getPaginatedResults } from '@/lib/db/pagination';

// In an API route
export async function GET(req: NextRequest) {
  const page = parseInt(req.nextUrl.searchParams.get('page') || '1');
  const limit = parseInt(req.nextUrl.searchParams.get('limit') || '10');
  
  const results = await getPaginatedResults('BirthProfile', 
    { page, limit },
    { 
      where: { user_clerk_id: userId },
      orderBy: { created_at: 'desc' }
    }
  );
  
  return NextResponse.json(results);
}
```

## Singleton Prisma Client

We use a singleton pattern for Prisma client to prevent connection exhaustion:

```typescript
// Import this everywhere instead of creating new PrismaClient instances
import { prisma } from '@/lib/db/prisma';
```

## Timezone Handling

Birth dates and times are stored with explicit timezone information:

- `date_of_birth`: Stores the date in UTC
- `time_of_birth`: Stores the time component
- `birth_timezone`: Stores the timezone as a string (e.g., "America/New_York")

When performing calculations, always combine these fields considering the timezone.