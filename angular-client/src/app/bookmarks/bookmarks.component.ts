import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { Medium, Message, MessageView, MessageViewWithUser, schema, Schema, Topic, TopicMessage, User } from '../util/schema';
import { MyEntityViewComponent } from '../my-entity-view/my-entity-view.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbDropdown, NgbDropdownModule, NgbModal, NgbPaginationModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { ZeroService } from 'zero-angular';
import { escapeLike, table } from '@rocicorp/zero';
import Cookies from "js-cookie";
import { EntityViewPermission } from '../my-entity-view/machine';
import { allRepositories as repo } from '../shared/allRepos';
import { randID } from '../util/rand';
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
      // this.displaymessages = messageViews.map((messageViews) => {
      //   const mv = messageViews as MessageViewWithUser;
      //   const m = mv.message || [];
      //   const topicMessage = m.topicMessage || [];
      //   const topicMessageCount = topicMessage.length;
      //   const messageViewCount = m.messageView.length;
      //   const messageLikeCount = m.messageView.filter((view) => view.like).length;
      //   const messageReplyCount = 0; // TODO: implement reply count
      //   const messageRepostCount = 0; // TODO: implement repost count
      //   return {
      //     // ...mv,
      //     ...m,
      //     topicMessage,
      //     sender: mv.user,
      //     topicMessageCount,
      //     messageViewCount,
      //     messageReplyCount,
      //     messageRepostCount,
      //     messageLikeCount,
      //   };
      // });
      // @TODO: Notify Angular that the data has changed
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
