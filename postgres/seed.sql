CREATE TABLE "user" (
  "id" VARCHAR PRIMARY KEY,
  "name" VARCHAR NOT NULL,
  "partner" BOOLEAN NOT NULL
);

CREATE TABLE "medium" (
  "id" VARCHAR PRIMARY KEY,
  "name" VARCHAR NOT NULL
);

CREATE TABLE "message" (
  "id" VARCHAR PRIMARY KEY,
  "sender_id" VARCHAR REFERENCES "user"(id),
  "medium_id" VARCHAR REFERENCES "medium"(id),
  "body" VARCHAR NOT NULL,
  "timestamp" TIMESTAMP not null
);

CREATE TABLE "topic" (
  "id" VARCHAR PRIMARY KEY,
  "name" VARCHAR NOT NULL
);
CREATE TABLE "topic_message" (
  "topic_id" VARCHAR REFERENCES "topic"(id),
  "message_id" VARCHAR REFERENCES "message"(id),
  PRIMARY KEY ("topic_id", "message_id")
);
CREATE TABLE "follower" (
  "user_id" VARCHAR REFERENCES "user"(id),
  "follower_id" VARCHAR REFERENCES "user"(id),
  PRIMARY KEY ("user_id", "follower_id")
);

INSERT INTO "user" (id, name, partner) VALUES ('ycD76wW4R2', 'Aaron', true);
INSERT INTO "user" (id, name, partner) VALUES ('IoQSaxeVO5', 'Matt', true);
INSERT INTO "user" (id, name, partner) VALUES ('WndZWmGkO4', 'Cesar', true);
INSERT INTO "user" (id, name, partner) VALUES ('ENzoNm7g4E', 'Erik', true);
INSERT INTO "user" (id, name, partner) VALUES ('dLKecN3ntd', 'Greg', true);
INSERT INTO "user" (id, name, partner) VALUES ('enVvyDlBul', 'Darick', true);
INSERT INTO "user" (id, name, partner) VALUES ('9ogaDuDNFx', 'Alex', true);
INSERT INTO "user" (id, name, partner) VALUES ('6z7dkeVLNm', 'Dax', false);
INSERT INTO "user" (id, name, partner) VALUES ('7VoEoJWEwn', 'Nate', false);

INSERT INTO "medium" (id, name) VALUES ('G14bSFuNDq', 'Discord');
INSERT INTO "medium" (id, name) VALUES ('b7rqt_8w_H', 'Twitter DM');
INSERT INTO "medium" (id, name) VALUES ('0HzSMcee_H', 'Tweet reply to unrelated thread');
INSERT INTO "medium" (id, name) VALUES ('ttx7NCmyac', 'SMS');

/** Postgres Procedure that triggers when a message is added
 * parse all '#' in the message body and create a topic for each one that does not exist
 * track the tpoic_id and message_id in the topic_message table
 * if the topic already exists, just add the message_id to the topic_message table
 */
CREATE OR REPLACE FUNCTION create_topic()
  RETURNS TRIGGER
  LANGUAGE PLPGSQL
  AS
$$
DECLARE
  m_topic_id VARCHAR;
  m_topic_name VARCHAR;
BEGIN
  -- Split the message body by spaces and check for topics
  FOR m_topic_name IN (
  	SELECT topic_name
	  FROM unnest(string_to_array(NEW.body, ' ')) AS topic_name
	  WHERE topic_name LIKE '#%'
  ) LOOP
    -- Remove the '#' from the topic name
    m_topic_name := substring(m_topic_name FROM 2);
    -- Check if the topic already exists
    SELECT id INTO m_topic_id FROM topic WHERE name = m_topic_name;

    -- If it doesn't exist, insert it
    IF NOT FOUND THEN
      INSERT INTO topic (id, name) VALUES (gen_random_uuid(), m_topic_name) RETURNING id INTO m_topic_id;
	  -- RAISE 'Created Topic: %', m_topic_id;
    END IF;

    -- Insert into the topic_message table
    INSERT INTO topic_message (topic_id, message_id) VALUES (m_topic_id, NEW.id);
  END LOOP;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER create_topic_trigger
  AFTER INSERT
  ON message
  FOR EACH ROW
  EXECUTE PROCEDURE create_topic();


-- Sample data for the topic table

-- INSERT INTO "message" (id, sender_id, medium_id, body, timestamp) VALUES ('1', 'ycD76wW4R2', 'G14bSFuNDq', 'Hello, how are you?', 1690000000);
-- INSERT INTO "message" (id, sender_id, medium_id, body, timestamp) VALUES ('2', 'IoQSaxeVO5', 'b7rqt_8w_H', 'I am good, thanks!', 1690000001);
-- INSERT INTO "message" (id, sender_id, medium_id, body, timestamp) VALUES ('3', 'WndZWmGkO4', '0HzSMcee_H', 'What are you up to?', 1690000002);
-- INSERT INTO "message" (id, sender_id, medium_id, body, timestamp) VALUES ('4', 'ENzoNm7g4E', 'ttx7NCmyac', 'Just working on some stuff.', 1690000003);
-- INSERT INTO "message" (id, sender_id, medium_id, body, timestamp) VALUES ('5', 'dLKecN3ntd', 'G14bSFuNDq', 'Sounds good!', 1690000004);
-- INSERT INTO "message" (id, sender_id, medium_id, body, timestamp) VALUES ('6', 'enVvyDlBul', 'b7rqt_8w_H', 'What are you working on?', 1690000005);
-- INSERT INTO "message" (id, sender_id, medium_id, body, timestamp) VALUES ('7', '9ogaDuDNFx', '0HzSMcee_H', 'Just some side projects.', 1690000006);
-- INSERT INTO "message" (id, sender_id, medium_id, body, timestamp) VALUES ('8', '6z7dkeVLNm', 'ttx7NCmyac', 'Nice! I love side projects.', 1690000007);
-- INSERT INTO "message" (id, sender_id, medium_id, body, timestamp) VALUES ('9', '7VoEoJWEwn', 'G14bSFuNDq', 'Me too!', 1690000008);
