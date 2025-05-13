
ALTER TABLE "message" ADD COLUMN "parent_id" VARCHAR REFERENCES "message"(id);
ALTER TABLE "message" ADD COLUMN "is_reply" BOOLEAN NOT NULL DEFAULT false;
