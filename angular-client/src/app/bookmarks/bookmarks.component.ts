import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { Medium, Message, MessageView, MessageViewWithUser, Schema, Topic, TopicMessage, User } from '../util/schema';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbDropdownModule, NgbPaginationModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { ZeroService } from 'zero-angular';
import { throttleTime } from 'rxjs';
import { MessageList } from '../components/message-list/message-list.component';
import { QueryConfig } from '../util/ZeroRepository';
import { MessageService } from '../services/message.service';

interface TopicMessageWithTopic extends TopicMessage {
  topic: Topic
}
interface DisplayMessage extends Message {
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
@Component({
  selector: 'app-bookmarks',
  imports: [CommonModule, FormsModule, NgbPaginationModule, NgbDropdownModule, NgbTooltipModule, MessageList],
  templateUrl: './bookmarks.component.html',
  styleUrl: './bookmarks.component.scss'
})
export class BookmarksComponent implements OnInit {
  zeroService = inject(ZeroService<Schema>);
  // zeroQuery = inject(QueryService);
  changeDetectorRef = inject(ChangeDetectorRef);
  userID: string = this.zeroService.getZero().userID;// TODO: store this in a service
  messageService = inject(MessageService);

  ngOnInit(): void {
    this.messageService.observeMessageViews({
      "queryParams": {
        "userID": this.userID,
        "bookmark": ['IS', true],
      },
      "relations": [
        {
          table: "message",
          cb: (q) => q,
        },
        {
          table: "user",
          cb: (q) => q,
        }
      ],
      "orderBy": { "timestamp": "desc" },
      "pageSize": this.pageSize,
      "startRecord": this.startRecord || undefined,
    })
    .subscribe((messages) => {
      console.log('All Bookmarks:', messages);
      this.allMessages = messages as MessageViewWithUser[];
    });
    this.triggerFetch();
  }

  filterUser: string = "";
  filterText: string = "";
  hasFilters: boolean = false;
  allMessages: MessageViewWithUser[] = [];
  queryConfig: QueryConfig<Schema, Message, 'message'> | undefined = undefined;
  displayMessages: DisplayMessage[] = [];
  triggerFetch(){
    this.messageService.observeMessageViews({
      "queryParams": {
        "userID": this.userID,
        "bookmark": ['IS', true],
      },
      "relations": [
        {
          table: "message",
          cb: (q) => q.related("messageView" as never).related("sender" as never),
        },
        {
          table: "user",
          cb: (q) => q,
        }
      ],
      "orderBy": { "timestamp": "desc" },
      "pageSize": this.pageSize,
      "startRecord": this.startRecord || undefined,
    })
    .pipe(throttleTime(100))
    .subscribe((messageViews) => {
      this.displayMessages = this.dataMap(messageViews as MessageViewWithUser[]);
      console.log('Current Bookmarks:', this.displayMessages);
    });
  }

  dataMap(res: MessageView[]): DisplayMessage[] {
    return res.map((messageView) => {
      const mv = messageView as MessageViewWithUser;
      const m = mv.message as DisplayMessage;
      // m.sender = mv.sender as User;
      // m.medium = mv.medium as Medium;
      m.messageView = [mv];
      return m;
    });
  }

  // PAGING
  collectionSize = 0;// - Number of elements/items in the collection. i.e. the total number of items the pagination should handle.
  pageSize = 10;// - Number of elements/items per page.
  page = 1;//- The current page.
  startRecord: DisplayMessage | null = null;// - The first record of the current page.

  triggerPagination(page: number) {
    this.page = page;
    this.startRecord = page === 1 ? null : this.displayMessages[this.displayMessages.length - 1];
    console.log("triggerPagination", this.page, this.startRecord);
    this.triggerFetch();
  }
}
