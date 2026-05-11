-- CreateTable
CREATE TABLE "Url" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "originalUrl" TEXT NOT NULL,
    "alias" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "maxClicks" INTEGER,
    "totalClicks" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Url_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Click" (
    "id" TEXT NOT NULL,
    "urlCode" TEXT NOT NULL,
    "clickedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "country" TEXT,
    "referrer" TEXT,
    "ipHash" TEXT,

    CONSTRAINT "Click_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Url_code_key" ON "Url"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Url_alias_key" ON "Url"("alias");

-- CreateIndex
CREATE INDEX "Click_urlCode_clickedAt_idx" ON "Click"("urlCode", "clickedAt");

-- AddForeignKey
ALTER TABLE "Click" ADD CONSTRAINT "Click_urlCode_fkey" FOREIGN KEY ("urlCode") REFERENCES "Url"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
