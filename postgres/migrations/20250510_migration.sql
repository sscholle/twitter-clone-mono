/**
-- EXAMPLE MIGRATION
BEGIN;

ALTER TABLE foo ADD bar ...;  -- without a DEFAULT value
UPDATE foo SET bar = ...;
ALTER TABLE foo ALTER bar SET DEFAULT ...;

COMMIT;
*/

BEGIN;

-- Message: for Repost (with or without body)
ALTER TABLE "message" ADD COLUMN "parent_id" VARCHAR REFERENCES "message"(id);
-- Message: for Comment/Reply (Replying to @username: )
ALTER TABLE "message" ADD COLUMN "is_reply" BOOLEAN NOT NULL DEFAULT false;


/**
* track message Views, Likes and Bookmarks
* a Message is 'Viewed' when the user 'sees' the message
* a Message is 'Liked' when the user 'likes' the message
* a Message is 'Bookmarked' when the user 'bookmarks' the message
*/
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

COMMIT;

