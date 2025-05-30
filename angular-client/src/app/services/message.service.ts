import { Injectable } from "@angular/core";
import { Schema as RSchema} from "@rocicorp/zero";
import { Follower, Medium, Message, MessageView, Schema, Topic, User } from "../util/schema";
import { Observable } from "rxjs";
import { QueryConfig, ZeroRepository } from "../util/ZeroRepository";

/**
 * Potential Messages Service
 * This service can be used to handle message-related logic, such as formatting messages,
 */
@Injectable({
  providedIn: 'root'
})
export class MessageService<S extends RSchema = Schema> {
  mediumRepo = new ZeroRepository<S, Medium>(
    'medium',
  );
  messageRepo = new ZeroRepository<S, Message>(
    'message',
  );
  messageViewsRepo = new ZeroRepository<S, MessageView>(
    'message_view',
    ['userID', 'messageID'],
  );
  userRepo = new ZeroRepository<S, User>(
    'user',
  );
  topicRepo = new ZeroRepository<S, Topic>(
    'topic',
  );
  followerRepo = new ZeroRepository<S, Follower>(
    'follower',
    ['userID', 'followerID'],
  );
  constructor() {

  }

  // #region GET MULTIPLE
  getTopics(): Promise<Topic[]> {
    // return repo.topic?.find() || Promise.resolve([]);
    if (this.topicRepo) {
      return this.topicRepo.find();
    } else {
      console.warn("Topic repository is not available.");
      return Promise.resolve([]);
    }
  }
  getUsers(): Promise<User[]> {
    // return repo.user?.find() || Promise.resolve([]);
    if (this.userRepo) {
      return this.userRepo.find();
    } else {
      console.warn("User repository is not available.");
      return Promise.resolve([]);
    }
  }
  getMediums(): Promise<Medium[]> {
    // return repo.medium?.find() || Promise.resolve([]);
    if (this.mediumRepo) {
      return this.mediumRepo.find();
    } else {
      console.warn("Medium repository is not available.");
      return Promise.resolve([]);
    }
  }
  // #endregion GET MULTIPLE

  // #region GET SINGLE
  getMedium(mediumID: string): Promise<Medium | null> {
    // return repo.medium?.findOne(mediumID) || Promise.resolve(null);
    if (this.mediumRepo) {
      return this.mediumRepo.findOne(mediumID);
    } else {
      console.warn("Medium repository is not available.");
      return Promise.resolve(null);
    }
  }
  getTopic(topicID: string): Promise<Topic | null> {
    // return repo.topic?.findOne(topicID) || Promise.resolve(null);
    if (this.topicRepo) {
      return this.topicRepo.findOne(topicID);
    } else {
      console.warn("Topic repository is not available.");
      return Promise.resolve(null);
    }
  }
  getUser(userID: string): Promise<User | null> {
    // return repo.user?.findOne(userID) || Promise.resolve(null);
    if (this.userRepo) {
      return this.userRepo.findOne(userID);
    } else {
      console.warn("User repository is not available.");
      return Promise.resolve(null);
    }
  }
  getMessage(messageID: string): Promise<Message | null> {
    // return repo.message?.findOne(messageID) || Promise.resolve(null);
    if (this.messageRepo) {
      return this.messageRepo.findOne(messageID);
    } else {
      console.warn("Message repository is not available.");
      return Promise.resolve(null);
    }
  }
  // #endregion GET SINGLE


  // #region GET MESSAGES
  getAllMessages(): Promise<Message[]> {
    if(this.messageRepo) {
      return this.messageRepo.find();
    }else {
      console.warn("Message repository is not available.");
      return Promise.resolve([]);
    }
  }
  observeMessages(queryConfig: QueryConfig<S, Message>) {
    if (this.messageRepo) {
      return this.messageRepo.findSubscribe(
        queryConfig.queryParams || {},
        queryConfig.relations || [],
        queryConfig.orderBy || {},
        queryConfig.pageSize || undefined,
        queryConfig.startRecord || undefined
      );
    } else {
      console.warn("Message repository is not available.");
      return new Observable<Message[]>(observer => {
        observer.error("Message repository is not available.");
      });
    }
  }
  observeAllMessages() {
    if (this.messageRepo) {
      return this.messageRepo.findSubscribe();
    } else {
      console.warn("Message repository is not available.");
      return new Observable<Message[]>(observer => {
        observer.error("Message repository is not available.");
      });
    }
  }
  // #endregion MESSAGES

  observeTopics() {
    if (this.topicRepo) {
      return this.topicRepo.findSubscribe();
    } else {
      console.warn("Topic repository is not available.");
      return new Observable<Topic[]>(observer => {
        observer.error("Topic repository is not available.");
      });
    }
  }

  observeFollowers(userID: string) {
    if (this.followerRepo) {
      return this.followerRepo.findSubscribe(
        {
          "followerID": userID || '',
        },
        [{
          table: "user",
          cb: (q) => q,
        }],
      );
    } else {
      console.warn("Follower repository is not available.");
      return new Observable<any[]>(observer => {
        observer.error("Follower repository is not available.");
      });
    }
  }

  /**
   * @todo - move to using a query config?
   * @param query
   * @param relations
   * @param orderBy
   * @param pageSize
   * @param startRecord
   * @returns
   */
  observeMessageViews(queryConfig: QueryConfig<S, MessageView>) {
    if (this.messageViewsRepo) {
      return this.messageViewsRepo.findSubscribe(
        queryConfig.queryParams || {},
        queryConfig.relations || [],
        queryConfig.orderBy || {},
        queryConfig.pageSize || undefined,
        queryConfig.startRecord || undefined
      );
    } else {
      console.warn("MessageView repository is not available.");
      return new Observable<any[]>(observer => {
        observer.error("MessageView repository is not available.");
      });
    }
  }


  // #region CREATE/DELETE
  followUser(userID: string, followerID: string) {
    console.log('Following user:', userID);
    if (!this.followerRepo) {
      console.warn("Follower repository is not available.");
      return Promise.reject("Follower repository is not available.");
    }
    return this.followerRepo.create({
      userID,
      followerID,
    } as any)
  }

  unFollowUser(userID: string, followerID: string) {
    console.log('Unfollowing user:', userID);
    if (!this.followerRepo) {
      console.warn("Follower repository is not available.");
      return Promise.reject("Follower repository is not available.");
    }
    return this.followerRepo?.delete({
      userID,
      followerID,
    } as any)
  }
  // #endregion CREATE/DELETE

  formatMessage(message: string): string {
    // Example formatting function
    return message.trim().replace(/\s+/g, ' ');
  }

  filterMessages(messages: string[], keyword: string): string[] {
    // Example filter function
    return messages.filter(msg => msg.includes(keyword));
  }
}
