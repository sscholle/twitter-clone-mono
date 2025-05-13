CREATE TABLE "message_view" (
  "user_id" VARCHAR REFERENCES "user"(id),
  "message_id" VARCHAR REFERENCES "message"(id),
  "timestamp" TIMESTAMP not null,
  "like" BOOLEAN DEFAULT false,
  "like_timestamp" TIMESTAMP,
  "bookmark" BOOLEAN DEFAULT false,
  "bookmark_timestamp" TIMESTAMP,
  PRIMARY KEY ("user_id", "message_id")
);
