CREATE TABLE "User" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "name" TEXT,
  "passwordHash" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

CREATE TABLE "IpoCalculation" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "ipoVersion" TEXT NOT NULL,
  "ipoSnapshot" JSONB NOT NULL,
  "inputs" JSONB NOT NULL,
  "result" JSONB NOT NULL,
  CONSTRAINT "IpoCalculation_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "IpoCalculation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "IpoCalculation_userId_createdAt_idx" ON "IpoCalculation"("userId", "createdAt");
