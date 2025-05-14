import { createMigration } from "../lib/db/migration-utils";

async function main() {
  // Parse command-line arguments
  const args = process.argv.slice(2);
  const options = {
    apply: args.includes('--apply'),
    verbose: args.includes('--verbose'),
    skipConfirmation: args.includes('--skip-confirmation'),
    name: args.find(arg => arg.startsWith('--name='))?.split('=')[1] || 'migration',
  };

  console.log(`
=========================================
Astrology AI Copilot - Database Migration
=========================================

Options:
- Apply migrations: ${options.apply ? 'Yes' : 'No (dry run)'}
- Migration name: ${options.name}
- Verbose output: ${options.verbose ? 'Yes' : 'No'}
- Skip confirmation: ${options.skipConfirmation ? 'Yes' : 'No'}
  `);

  if (!options.apply) {
    console.log(`
Note: This is a DRY RUN. No changes will be applied to the database.
To apply changes, run with --apply flag.
    `);
  }

  // Run the migration
  const result = await createMigration(options);

  // Print results
  console.log(result 
    ? '\n✅ Migration completed successfully'
    : '\n❌ Migration failed');

  // Exit with appropriate code
  process.exit(result ? 0 : 1);
}

main().catch(error => {
  console.error('Unhandled error during migration:', error);
  process.exit(1);
});