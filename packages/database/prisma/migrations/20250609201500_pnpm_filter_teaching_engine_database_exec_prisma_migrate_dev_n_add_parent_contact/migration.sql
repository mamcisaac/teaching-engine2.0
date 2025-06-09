-- CreateTable
CREATE TABLE "ParentContact" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "studentName" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "ParentContact_email_key" ON "ParentContact"("email");
