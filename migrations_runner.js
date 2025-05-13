import {migrate} from "postgres-migrations"

async function migrationFunction() {
  const dbConfig = {
    database: process.env.POSTGRES_DB || "postgres",
    user: process.env.POSTGRES_USER || "postgres",
    password: process.env.POSTGRES_PASSWORD || "password",
    host: process.env.POSTGRES_HOST || "localhost",
    port: Number.parseInt(process.env.POSTGRES_PORT, 10) || 5432,

    // Default: false for backwards-compatibility
    // This might change!
    ensureDatabaseExists: true,

    // Default: "postgres"
    // Used when checking/creating "database-name"
    defaultDatabase: "postgres"
  }
  console.log("Running migrations with config:", dbConfig)
  return migrate(dbConfig, "postgres/migrations");
  // console.log("Migration results:", results)
}
migrationFunction()
  .then((results) => {
    console.log("Migration completed successfully", results)
  })
  .catch((error) => {
    console.error("Error during migration:", error)
  })
  .finally(() => {
    process.exit(0)
  })