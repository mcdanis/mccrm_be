/*
  Warnings:

  - You are about to drop the `Contact_parent` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Contact_parent";

-- CreateTable
CREATE TABLE "Contact_Parent" (
    "id" SERIAL NOT NULL,
    "parent_contact_id" INTEGER NOT NULL,
    "contact_id" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Contact_Parent_pkey" PRIMARY KEY ("id")
);
