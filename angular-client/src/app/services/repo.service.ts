import { Injectable } from "@angular/core";
import { ZeroRepository } from "../util/ZeroRepository";
import { Schema as RSchema} from "@rocicorp/zero";
import { Follower, Medium, Message, MessageView, Schema, Topic, User } from "../util/schema";

@Injectable({
  providedIn: 'root'
})
export class RepoService<S extends RSchema = Schema> {
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
  // This service can be used to handle repository-related logic, such as fetching repositories, etc.
  // Currently, it is empty but can be extended in the future.
  constructor() {
    console.log("RepoService initialized");
  }

  // Example method to fetch repositories (to be implemented)
  fetchRepositories(): Promise<any[]> {
    // Placeholder for fetching repositories logic
    return Promise.resolve([]);
  }
}
