import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { Medium, Message, MessageView, MessageViewWithUser, Schema, Topic, TopicMessage, User } from '../util/schema';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbDropdownModule, NgbPaginationModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { ZeroService } from 'zero-angular';
import { allRepositories as repo } from '../shared/allRepos';
import { auditTime, throttleTime } from 'rxjs';

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
  imports: [CommonModule, FormsModule, NgbPaginationModule, NgbDropdownModule, NgbTooltipModule],
  templateUrl: './bookmarks.component.html',
  styleUrl: './bookmarks.component.scss'
})
export class BookmarksComponent implements OnInit {
  zeroService = inject(ZeroService<Schema>);
  // zeroQuery = inject(QueryService);
  changeDetectorRef = inject(ChangeDetectorRef);

  userID: string = this.zeroService.getZero().userID;// TODO: store this in a service

  ngOnInit(): void {
    repo.messageView?.findSubscribe(
      {
        "userID": this.userID,
        "bookmark": ['IS', true],
      },
      [
        {
          table: "message",
          cb: (q) => q,
        },
        {
          table: "user",
          cb: (q) => q,
        }
      ],
      { "timestamp": "desc" },
    )
    .pipe(throttleTime(100))
    .subscribe((messages) => {
      console.log('All Bookmarks:', messages);
      // this.allMessages = messages as MessageViewWithUser[];
    });
    this.triggerFetch();
  }

  filterUser: string = "";
  filterText: string = "";
  hasFilters: boolean = false;
  displaymessages:DisplayMessage[] = [];
  allMessages: DisplayMessage[] = [];
  triggerFetch(){
    this.hasFilters = !!(this.filterUser || this.filterText);
    repo.messageView?.findSubscribe(
      {
        "userID": this.userID,
        "bookmark": ['IS', true],
      },
      [
        {
          table: "message",
          cb: (q) => q.related("messageView" as never).related("sender" as never),
        },
        {
          table: "user",
          cb: (q) => q,
        }
      ],
      { "timestamp": "desc" },
      this.pageSize,
      this.startRecord || undefined,
    )
    .pipe(auditTime(100))
    .subscribe((messageViews) => {
      console.log('messageViews:', messageViews);
      const messages = messageViews.map((messageViews) => {
        const mv = messageViews as MessageViewWithUser;
        const m = mv.message;
        return m;
      });
      this.displaymessages = messages as DisplayMessage[];
      // @TODO: consolidate how all the Entities are queried via Services - and use more Granular Components for Display
      this.changeDetectorRef.detectChanges();
    })
  }

  // PAGING
  collectionSize = 0;// - Number of elements/items in the collection. i.e. the total number of items the pagination should handle.
  pageSize = 10;// - Number of elements/items per page.
  page = 1;//- The current page.
  startRecord: DisplayMessage | null = null;// - The first record of the current page.

  triggerPagination(page: number) {
    this.page = page;
    this.startRecord = page === 1 ? null : this.displaymessages[this.displaymessages.length - 1];
    console.log("triggerPagination", this.page, this.startRecord);
    this.triggerFetch();
  }
}
