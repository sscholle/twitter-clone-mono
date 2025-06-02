import { inject, Injectable } from "@angular/core";
import { Schema as RSchema} from "@rocicorp/zero";
import { Follower, Medium, Message, MessageView, Schema, Topic, User } from "../util/schema";
import { Observable } from "rxjs";
import { ItemNotFoundError, QueryConfig } from "../util/ZeroRepository";
import { AuthService } from "./auth.service";
import { RepoService } from "./repo.service";
import { messageShape } from "../shared/DisplayMessage";

/**
 * Potential Messages Service
 * This service can be used to handle message-related logic, such as formatting messages,
 */
@Injectable({
  providedIn: 'root'
})
export class MessageService<S extends RSchema = Schema> {
  authService = inject(AuthService); // Assuming you have an AuthService for authentication
  repoService  = inject(RepoService<S>);
  topicRepo = this.repoService.topicRepo;
  userRepo = this.repoService.userRepo;
  mediumRepo = this.repoService.mediumRepo;
  messageRepo = this.repoService.messageRepo;
  followerRepo = this.repoService.followerRepo;
  messageViewsRepo = this.repoService.messageViewsRepo;
  constructor() {
    console.log("MessageService initialized");
    // You can initialize any other properties or services here if needed
  }

  // #region GET MULTIPLE
  getTopics(): Observable<Topic[]> {
    return this.topicRepo.find();
  }
  getUsers(): Observable<User[] | Error> {
    return this.userRepo.find<ItemNotFoundError>();// TODO: investigate error handling techniques
  }
  getMediums(): Observable<Medium[]> {
    return this.mediumRepo.find();
  }
  // #endregion GET MULTIPLE

  // #region GET SINGLE
  getMedium(mediumID: string): Observable<Medium | null> {
      return this.mediumRepo.findOne(mediumID);
  }
  getTopic(topicID: string): Observable<Topic | null> {
    return this.topicRepo.findOne(topicID);
  }

  getMessage(messageID: string): Observable<Message | null> {
    return this.messageRepo.findOne(messageID);
  }
  // #endregion GET SINGLE


  // #region GET MESSAGES
  getAllMessages(): Observable<Message[]> {
    return this.messageRepo.find();
  }

  observeMessages(queryConfig: QueryConfig<S, Message, 'message'>) {
    if (this.messageRepo) {
      return this.messageRepo.find(
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
      return this.messageRepo.find();
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
      return this.topicRepo.find();
    } else {
      console.warn("Topic repository is not available.");
      return new Observable<Topic[]>(observer => {
        observer.error("Topic repository is not available.");
      });
    }
  }

  observeFollowers(userID: string) {
    if (this.followerRepo) {
      console.log("Observing followers for userID:", userID);
      return this.followerRepo.find(
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
  observeMessageViews(queryConfig: QueryConfig<S, MessageView, 'message_view'>): Observable<MessageView[]> {
    if (this.messageViewsRepo) {
      return this.messageViewsRepo.find(
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
  postMessage(body: string, senderID: string, mediumID: string): Promise<boolean> {
    if (!this.messageRepo) {
      console.warn("Message repository is not available.");
      return Promise.reject("Message repository is not available.");
    }
    if (!senderID) {
      console.warn("Message must have a senderID.");
      return Promise.reject("Message must have a senderID.");
    }
    if (!body) {
      console.warn("Message must have a body.");
      return Promise.reject("Message must have a body.");
    }
    return this.messageRepo.create(messageShape(mediumID,senderID, body));
  }

  bookmarkMessage(messageID: string, userID: string, flag: boolean): Promise<boolean> {
    if (!this.messageViewsRepo) {
      console.warn("MessageViews repository is not available.");
      return Promise.reject("MessageViews repository is not available.");
    }
    return this.messageViewsRepo.update({
      userID,
      messageID,
      bookmark: flag,
      bookmarkTimestamp: new Date().getTime(),
    })
  }

  likeMessage(messageID: string, userID: string, flag: boolean): Promise<boolean> {
    if (!this.messageViewsRepo) {
      console.warn("MessageViews repository is not available.");
      return Promise.reject("MessageViews repository is not available.");
    }
    return this.messageViewsRepo.update({
      userID,
      messageID,
      like: flag,
      likeTimestamp: new Date().getTime(),
    });
  }
  batchMessageView(messageViews: Partial<MessageView>[]){
    if (!this.messageViewsRepo) {
      console.warn("MessageViews repository is not available.");
      return Promise.reject("MessageViews repository is not available.");
    }
    return this.messageViewsRepo.batchUpsert(messageViews);
  }
  // #endregion CREATE/DELETE

  // #region UPDATE
  updateMessage(message: Partial<Message>): Promise<boolean> {
    if (!this.messageRepo) {
      console.warn("Message repository is not available.");
      return Promise.reject("Message repository is not available.");
    }
    if (!message.id) {
      console.warn("Message must have an id to update.");
      return Promise.reject("Message must have an id to update.");
    }
    return this.messageRepo.update(message);
  }


  deleteMessage(message: Message): Promise<boolean> {
    if (!this.messageRepo) {
      console.warn("Message repository is not available.");
      return Promise.reject("Message repository is not available.");
    }
    if (!message.id) {
      console.warn("Message must have an id to delete.");
      return Promise.reject("Message must have an id to delete.");
    }
    return this.messageRepo.delete(message);
  }
  // #endregion UPDATE


  // #region FORMAT AND FILTER MESSAGES
  formatMessage(message: string): string {
    // Example formatting function
    return message.trim().replace(/\s+/g, ' ');
  }

  filterMessages(messages: string[], keyword: string): string[] {
    // Example filter function
    return messages.filter(msg => msg.includes(keyword));
  }
  // #endregion FORMAT AND FILTER MESSAGES

  // #region MESSAGE LIST QUERY CONFIGS
  getMessageListQueryConfig(userID: string): QueryConfig<S, Message, 'message'> {
    return {
      queryParams: { senderID: userID },
      relations: [
        {
          table: "medium",
          cb: (q) => q,
        },
        {
          table: "sender",
          cb: (q) => q,
        },
        {
          table: "topicMessage",
          cb: (q) => q.related("topic" as never),
        },
        {
          table: "messageView",
          cb: (q) => q,
        }
      ],
      orderBy: { "timestamp": "desc" },
    };
  }
  // getHomeMessageQueryConfig(userID: string): QueryConfig<S, Message> {
  //   return {
  //     queryParams: {
  //       senderID: ["IN", this.authService.followingUsers.map(user => userID)],
  //     },
  //     relations: [
  //       {
  //         table: "medium",
  //         cb: (q) => q,
  //       },
  //       {
  //         table: "sender",
  //         cb: (q) => q,
  //       },
  //       {
  //         table: "topicMessage",
  //         cb: (q) => q.related("topic" as never),
  //       },
  //       {
  //         table: "messageView",
  //         cb: (q) => q,
  //       }
  //     ],
  //     orderBy: { "timestamp": "desc" },
  //   };
  // }
}
