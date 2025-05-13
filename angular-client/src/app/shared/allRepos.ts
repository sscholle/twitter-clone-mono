import { Follower, Medium, Message, MessageView, Schema, Topic, User } from "../util/schema";
import { ZeroRepository } from "../util/ZeroRepository";

type TableKey = "message" | "medium" | "user";
type AllRepositories = {
  [K in TableKey]: ZeroRepository<Schema, Message | User | Medium> | null;
};

export const allRepositories = {
  message: null as ZeroRepository<Schema, Message> | null,
  medium: null as ZeroRepository<Schema, Medium> | null,
  user: null as ZeroRepository<Schema, User> | null,
  topic: null as ZeroRepository<Schema, Topic> | null,
  follower: null as ZeroRepository<Schema, Follower> | null,
  messageView: null as ZeroRepository<Schema, MessageView> | null,
};

