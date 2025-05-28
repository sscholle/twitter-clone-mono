import { Injectable } from "@angular/core";

import { allRepositories as repo } from '../shared/allRepos';

/**
 * Potential Messages Service
 * This service can be used to handle message-related logic, such as formatting messages,
 */
@Injectable({
  providedIn: 'root'
})
export class MessageService {
  // This service can be used to handle message-related logic, such as formatting messages,
  // filtering messages, or any other message-specific functionality.
  private messageRepo = repo.message;
  constructor() { }

  // getMessages(query: any, config?: any): Promise<any[]> {
  //   // Example method to fetch messages from the repository
  //   return this.messageRepo.find(query, config);
  // }

  formatMessage(message: string): string {
    // Example formatting function
    return message.trim().replace(/\s+/g, ' ');
  }

  filterMessages(messages: string[], keyword: string): string[] {
    // Example filter function
    return messages.filter(msg => msg.includes(keyword));
  }
}
