-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Employee" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "position" TEXT NOT NULL DEFAULT 'Employee',
    "startDate" DATETIME NOT NULL,
    "salary" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "avatarUrl" TEXT,
    "bankAccount" TEXT,
    "bankName" TEXT,
    "cedula" TEXT,
    "conectividadDefault" REAL NOT NULL DEFAULT 0,
    "toolsDefault" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "companyId" TEXT NOT NULL,
    CONSTRAINT "Employee_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Employee" ("avatarUrl", "bankAccount", "bankName", "cedula", "companyId", "createdAt", "email", "firstName", "id", "lastName", "phone", "position", "salary", "startDate", "status", "updatedAt") SELECT "avatarUrl", "bankAccount", "bankName", "cedula", "companyId", "createdAt", "email", "firstName", "id", "lastName", "phone", "position", "salary", "startDate", "status", "updatedAt" FROM "Employee";
DROP TABLE "Employee";
ALTER TABLE "new_Employee" RENAME TO "Employee";
CREATE UNIQUE INDEX "Employee_email_key" ON "Employee"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
