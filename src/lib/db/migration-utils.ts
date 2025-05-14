import { spawn } from 'child_process';
import { z } from 'zod';
import { env } from '../env/server';

interface MigrationOptions {
  /**
   * Prints more detailed information during command execution
   */
  verbose?: boolean;
  
  /**
   * Whether to apply migrations to the database. 
   * When false, this will perform a dry run.
   */
  apply?: boolean;
  
  /**
   * Name of the migration
   */
  name?: string;

  /**
   * Skip confirmation prompt (for CI/CD environments)
   */
  skipConfirmation?: boolean;
}

/**
 * Creates a new migration
 */
export async function createMigration(options: MigrationOptions = {}) {
  const { verbose = false, apply = false, name = 'migration', skipConfirmation = false } = options;
  
  // Validate DATABASE_URL
  try {
    z.string().url().parse(env.DATABASE_URL);
  } catch (error) {
    console.error('❌ Invalid DATABASE_URL in environment variables');
    return false;
  }

  // Create the command
  const command = 'npx';
  const args = ['prisma', 'migrate'];
  
  if (apply) {
    args.push('dev');
    args.push('--name', name);
    
    if (skipConfirmation) {
      args.push('--skip-generate');
    }
  } else {
    // Dry run only
    console.log('🔍 Performing migration dry run...');
    args.push('dev', '--create-only', '--name', name);
  }
  
  return new Promise<boolean>((resolve) => {
    const process = spawn(command, args, { stdio: verbose ? 'inherit' : 'pipe' });
    
    if (!verbose) {
      process.stdout?.on('data', (data) => {
        console.log(data.toString());
      });
      
      process.stderr?.on('data', (data) => {
        console.error(data.toString());
      });
    }
    
    process.on('close', (code) => {
      if (code === 0) {
        console.log(apply 
          ? '✅ Migration successfully applied' 
          : '✅ Migration files created. Review them before applying.');
        resolve(true);
      } else {
        console.error(`❌ Migration failed with exit code ${code}`);
        resolve(false);
      }
    });
  });
}

/**
 * Apply migrations to the database in production environment
 */
export async function applyProductionMigrations(options: { force?: boolean } = {}) {
  const { force = false } = options;
  
  // Validate environment
  if (process.env.NODE_ENV !== 'production' && !force) {
    console.error('❌ This script should only be run in production. Use --force to override.');
    return false;
  }
  
  // Validate DATABASE_URL
  try {
    z.string().url().parse(env.DATABASE_URL);
  } catch (error) {
    console.error('❌ Invalid DATABASE_URL in environment variables');
    return false;
  }
  
  // Execute migration
  console.log('🔄 Applying production migrations...');
  return new Promise<boolean>((resolve) => {
    const process = spawn('npx', ['prisma', 'migrate', 'deploy'], { stdio: 'inherit' });
    
    process.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Production migrations successfully applied');
        resolve(true);
      } else {
        console.error(`❌ Production migration failed with exit code ${code}`);
        resolve(false);
      }
    });
  });
}