import { randID } from "../util/rand";
import { Medium, Message, MessageView, Topic, TopicMessage, User } from "../util/schema"

export interface TopicMessageWithTopic extends TopicMessage {
  topic: Topic
}
export interface DisplayMessage extends Message {
  sender: User,
  medium: Medium
  topicMessage?: TopicMessageWithTopic[],
  messageView: MessageView[],
  // generated (Zero does not support aggregation functions yet)
  topicMessageCount?: number,
  messageViewCount?: number,
  messageReplyCount?: number,
  messageRepostCount?: number,
  messageLikeCount?: number,
}

export function messageShape(
  mediumID: string,
  senderID: string,
  body: string,
): Message {
  const id = randID();
  const timestamp = new Date().getTime();
  return {
    id,
    senderID,
    mediumID,
    body,
    timestamp,
  };
}
