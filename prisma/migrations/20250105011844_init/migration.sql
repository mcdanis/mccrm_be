/*
  Warnings:

  - You are about to drop the column `client_name` on the `Client` table. All the data in the column will be lost.
  - You are about to drop the column `client_status` on the `Client` table. All the data in the column will be lost.
  - Added the required column `name` to the `Client` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `Client` table without a default value. This is not possible if the table is not empty.
  - Added the required column `role` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Client" DROP COLUMN "client_name",
DROP COLUMN "client_status",
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "status" VARCHAR(2) NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Campaign" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "client_id" INTEGER NOT NULL,
    "status" VARCHAR(2) NOT NULL,
    "created_by" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sub_Campaign" (
    "id" SERIAL NOT NULL,
    "campaign_id" INTEGER NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "owner" INTEGER NOT NULL,
    "manager" INTEGER NOT NULL,
    "status" VARCHAR(2) NOT NULL,
    "client_id" INTEGER NOT NULL,
    "created_by" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Sub_Campaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contact" (
    "id" SERIAL NOT NULL,
    "sub_campaign_id" INTEGER NOT NULL,
    "first_name" VARCHAR(20) NOT NULL,
    "last_name" VARCHAR(30) NOT NULL,
    "email" TEXT NOT NULL,
    "country" VARCHAR(30) NOT NULL,
    "address" VARCHAR(255) NOT NULL,
    "tag" VARCHAR(10) NOT NULL,
    "level_priority" VARCHAR(2) NOT NULL,
    "source" TEXT NOT NULL,
    "status" VARCHAR(2) NOT NULL,
    "result_negotiation" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contact_parent" (
    "id" SERIAL NOT NULL,
    "parent_contact_id" INTEGER NOT NULL,
    "contact_id" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Contact_parent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" SERIAL NOT NULL,
    "contact_id" INTEGER NOT NULL,
    "tag" VARCHAR(10) NOT NULL,
    "note" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contact_Note" (
    "id" SERIAL NOT NULL,
    "sub_campaign_id" INTEGER NOT NULL,
    "contact_id" INTEGER NOT NULL,
    "note" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Contact_Note_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contact_Activity" (
    "id" SERIAL NOT NULL,
    "contact_id" INTEGER NOT NULL,
    "title" VARCHAR(50) NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Contact_Activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contact_Bant" (
    "id" SERIAL NOT NULL,
    "contact_id" INTEGER NOT NULL,
    "lead_type" INTEGER NOT NULL,
    "lead_owner" INTEGER NOT NULL,
    "budget" TEXT NOT NULL,
    "authority" TEXT NOT NULL,
    "need" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "spesification_project" TEXT NOT NULL,
    "next_step" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Contact_Bant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contact_Timeline" (
    "id" SERIAL NOT NULL,
    "contact_id" INTEGER NOT NULL,
    "sub_campaign_id" INTEGER NOT NULL,
    "title" VARCHAR(30) NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Contact_Timeline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Campaign_User" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "sub_campaign_id" INTEGER NOT NULL,
    "client_id" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Campaign_User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Contact_email_key" ON "Contact"("email");
