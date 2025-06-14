import { PrismaClient } from '@prisma/client';
import path from 'path';

async function testConnection() {
  const dbPath = path.resolve(__dirname, '../../packages/database/prisma/test-db.sqlite');
  
  console.log(`Connecting to database at: ${dbPath}`);
  
  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
    datasources: {
      db: {
        url: `file:${dbPath}`
      }
    }
  });

  try {
    // Test connection
    await prisma.$connect();
    console.log('✅ Successfully connected to the database');

    // List all tables
    const tables = await prisma.$queryRaw`
      SELECT name FROM sqlite_master 
      WHERE type='table' 
      AND name NOT LIKE 'sqlite_%'
      AND name NOT LIKE '_prisma_%'
      ORDER BY name
    `;
    
    console.log('\n📋 Database tables:');
    console.log(JSON.stringify(tables, null, 2));

    // Try to query the database
    try {
      // List all available models (tables)
      const tableResults = await prisma.$queryRaw<Array<{ name: string }>>`
        SELECT name FROM sqlite_master 
        WHERE type='table' 
        AND name NOT LIKE 'sqlite_%'
        AND name NOT LIKE '_prisma_%'
        ORDER BY name
      `;
      
      console.log('\n🔍 Available tables:');
      console.log(JSON.stringify(tableResults, null, 2));
      
      // Try to query each table
      for (const table of tableResults) {
        try {
          console.log(`\n📊 Querying table: ${table.name}`);
          // Use a type assertion for the result since we don't know the exact shape
          const result = await prisma.$queryRawUnsafe<Array<Record<string, unknown>>>(`SELECT * FROM \`${table.name}\` LIMIT 5`);
          console.log(JSON.stringify(result, null, 2));
        } catch (error) {
          console.error(`  ❌ Error querying table ${table.name}:`, error instanceof Error ? error.message : String(error));
        }
      }
    } catch (error) {
      console.error('\n❌ Error querying database:', error instanceof Error ? error.message : String(error));
    }

  } catch (error) {
    console.error('\n❌ Database connection error:', error instanceof Error ? error.message : String(error));
  } finally {
    await prisma.$disconnect();
  }
}

testConnection().catch(console.error);
