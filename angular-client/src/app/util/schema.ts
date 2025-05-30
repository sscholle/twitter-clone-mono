// These data structures define your client-side schema.
// They must be equal to or a subset of the server-side schema.
// Note the "relationships" field, which defines first-class
// relationships between tables.
// See https://github.com/rocicorp/mono/blob/main/apps/zbugs/schema.ts
// for more complex examples, including many-to-many.

import {
  createSchema,
  definePermissions,
  ExpressionBuilder,
  Row,
  ANYONE_CAN,
  table,
  string,
  boolean,
  number,
  relationships,
  PermissionsConfig,
  NOBODY_CAN,
} from "@rocicorp/zero";

const message = table("message")
  .columns({
    id: string(),
    senderID: string().from("sender_id"),
    mediumID: string().from("medium_id"),
    body: string(),
    timestamp: number(),
  })
  .primaryKey("id");

const user = table("user")
  .columns({
    id: string(),
    name: string(),
    partner: boolean(),
  })
  .primaryKey("id");

const medium = table("medium")
  .columns({
    id: string(),
    name: string(),
  })
  .primaryKey("id");

/**
 * When a Message is added, the server will create a Topic (via DB trigger)
 * To get Trending Topics: we can query the Topic table with Related Messages and sort and limit
 * by the number of messages in the Topic.
 * since this does not change much, we can cache it in the client
 * and update it every 5 minutes or so.
 */
const topic = table("topic")
  .columns({
    id: string(),
    name: string(),
  })
  .primaryKey("id");

  const topicMessage = table("topic_message")
  .columns({
    topicID: string().from("topic_id"),
    messageID: string().from("message_id"),
  })
  .primaryKey("topicID", "messageID");

const follower = table("follower")
  .columns({
    userID: string().from("user_id"),
    followerID: string().from("follower_id"),
  })
  .primaryKey("userID", "followerID");

/**
   * CREATE TABLE "message_view" (
  "user_id" VARCHAR REFERENCES "user"(id),
  "message_id" VARCHAR REFERENCES "message"(id),
  "timestamp" TIMESTAMP not null,
  "like" BOOLEAN DEFAULT false,
  "like_timestamp" TIMESTAMP,
  "bookmark" BOOLEAN DEFAULT false,
  "bookmark_timestamp" TIMESTAMP,
  PRIMARY KEY ("user_id", "message_id")
);
*/
const messageView = table("message_view")
  .columns({
    userID: string().from("user_id"),
    messageID: string().from("message_id"),
    timestamp: number(),
    like: boolean(),
    likeTimestamp: number().from("like_timestamp"),
    bookmark: boolean(),
    bookmarkTimestamp: number().from("bookmark_timestamp"),
  })
  .primaryKey("userID", "messageID");

const messageViewRelationships = relationships(messageView, ({ one }) => ({
  user: one({
    sourceField: ["userID"],
    destField: ["id"],
    destSchema: user,
  }),
  message: one({
    sourceField: ["messageID"],
    destField: ["id"],
    destSchema: message,
  }),
}));

const followerRelationships = relationships(follower, ({ one }) => ({
  user: one({
    sourceField: ["userID"],
    destField: ["id"],
    destSchema: user,
  }),
  follower: one({
    sourceField: ["followerID"],
    destField: ["id"],
    destSchema: user,
  }),
}));

const messageRelationships = relationships(message, ({ one, many }) => ({
  sender: one({
    sourceField: ["senderID"],
    destField: ["id"],
    destSchema: user,
  }),
  medium: one({
    sourceField: ["mediumID"],
    destField: ["id"],
    destSchema: medium,
  }),
  topicMessage: many({
    sourceField: ["id"],
    destField: ["messageID"],
    destSchema: topicMessage,
  }),
  messageView: many({
    sourceField: ["id"],
    destField: ["messageID"],
    destSchema: messageView,
  }),
}));

// const topicRelationships = relationships(topic, ({ one }) => ({
//   topicMessage: one({
//     sourceField: ["id"],
//     destField: ["topicID"],
//     destSchema: topicMessage,
//   }),
// }));
const topicMessageRelationships = relationships(topicMessage, ({ one }) => ({
  message: one({
    sourceField: ["messageID"],
    destField: ["id"],
    destSchema: message,
  }),
  topic: one({
    sourceField: ["topicID"],
    destField: ["id"],
    destSchema: topic,
  }),
}));


export const schema = createSchema({
  tables: [user, medium, message, follower, topic, topicMessage, messageView],
  relationships: [messageRelationships, followerRelationships, topicMessageRelationships, messageViewRelationships],
  // relationships: [messageRelationships, followerRelationships, topicRelationships, topicMessageRelationships],
});

export type Schema = typeof schema;
export type Message = Row<typeof schema.tables.message>;
export type Medium = Row<typeof schema.tables.medium>;
export type User = Row<typeof schema.tables.user>;
export type Topic = Row<typeof schema.tables.topic>;
export type Follower = Row<typeof schema.tables.follower>;
export type TopicMessage = Row<typeof schema.tables.topic_message>;
export type MessageView = Row<typeof schema.tables.message_view>;
export type MessageViewWithUser = Row<typeof schema.tables.message_view> & {
  user: Row<typeof schema.tables.user>;
  message: Message & {
    sender: User;
    medium: Medium;
    topicMessage?: TopicMessage[];
    messageView: MessageView[];
  };
};

// The contents of your decoded JWT.
type AuthData = {
  sub: string | null;
};

export const permissions = definePermissions<AuthData, Schema>(schema, () => {

  const allowIfLoggedIn = (
    authData: AuthData,
    { cmpLit }: ExpressionBuilder<Schema, keyof Schema["tables"]>
  ) => cmpLit(authData.sub, "IS NOT", null);

  const allowIfMessageSender = (
    authData: AuthData,
    { cmp }: ExpressionBuilder<Schema, "message">
  ) => cmp("senderID", "=", authData.sub ?? "");

  const allowIfYourFollower = (
    authData: AuthData,
    { cmp }: ExpressionBuilder<Schema, "follower">
  ) => cmp("followerID", "=", authData.sub ?? "");

  const allowIfViewOwner = (
    authData: AuthData,
    { cmp }: ExpressionBuilder<Schema, "message_view">
  ) => cmp("userID", "=", authData.sub ?? "");

  return {
    medium: {
      row: {
        select: ANYONE_CAN,
      },
    },
    user: {
      row: {
        select: ANYONE_CAN,
      },
    },
    message: {
      row: {
        // anyone can insert
        insert: ANYONE_CAN,
        update: {
          // sender can only edit own messages
          preMutation: [allowIfLoggedIn, allowIfMessageSender],
          // sender can only edit messages to be owned by self
          postMutation: [allowIfLoggedIn, allowIfMessageSender],
        },
        // must be logged in to delete
        delete: [allowIfLoggedIn, allowIfMessageSender],
        // everyone can read current messages
        select: ANYONE_CAN,
      },
    },
    message_view: {
      row: {
        select: ANYONE_CAN,
        insert: [allowIfLoggedIn],
        update: {
          // user can only edit own messages
          preMutation: [allowIfLoggedIn, allowIfViewOwner],
          // user can only edit messages to be owned by self
          postMutation: [allowIfLoggedIn, allowIfViewOwner],
        },
        delete: NOBODY_CAN,
      },
    },
    topic: {
      row: {
        select: ANYONE_CAN,
        // Topics are server generated... so no need to insert on client
      },
    },
    topic_message: {
      row: {
        select: ANYONE_CAN,
        // Topic Messages are server generated... so no need to insert on client
      },
    },
    follower: {
      row: {
        select: ANYONE_CAN,
        insert: [allowIfLoggedIn],
        delete: [allowIfLoggedIn, allowIfYourFollower],
      },
    },
  } satisfies PermissionsConfig<AuthData, Schema>;
});
