import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { Medium, Message, MessageView, schema, Schema, Topic, TopicMessage, User } from '../util/schema';
import { MyEntityViewComponent } from '../my-entity-view/my-entity-view.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbDropdown, NgbDropdownModule, NgbModal, NgbPaginationModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { ZeroService } from 'zero-angular';
import { escapeLike } from '@rocicorp/zero';
import Cookies from "js-cookie";
import { EntityViewPermission } from '../my-entity-view/machine';
import { allRepositories as repo } from '../shared/allRepos';
import { randID } from '../util/rand';
import { auditTime, BehaviorSubject, filter, take, throttleTime } from 'rxjs';

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
  selector: 'components-messages',
  imports: [CommonModule, FormsModule, NgbPaginationModule, NgbDropdownModule, NgbTooltipModule],
  templateUrl: './messages.component.html',
  styleUrl: './messages.component.scss'
})
export class MessagesComponent implements OnInit {
  zeroService = inject(ZeroService<Schema>);
  // zeroQuery = inject(QueryService);
	modalService = inject(NgbModal);
  changeDetectorRef = inject(ChangeDetectorRef);

  users: User[] | null = null;
  mediums: Medium[] | null = null;
  allMessages: Message[] | null = null;
  userID: string = this.zeroService.getZero().userID;// TODO: store this in a service
  user: User | null = null;

  ngOnInit(): void {
    if(this.userID === "anon") {
      console.log("User is anonymous");
    } else {
      console.log(repo.user);
      repo.user?.findOne(this.userID || "")
      .then((user) => {
        console.log('User:', user);
        this.user = user as User;
      });
    }
    repo.user?.find()
    .then((users) => {
      console.log('Users:', users);
      this.users = users as User[];
    });
    repo.medium?.find()
    .then((mediums) => {
      console.log('Mediums:', mediums);
      this.mediums = mediums as Medium[];
    });
    repo.message?.findSubscribe()
    .subscribe((messages) => {
      console.log('Messages:', messages);
      this.allMessages = messages as Message[];
    });
    this.triggerFetch();
  }

  triggerFetch(){
    this.hasFilters = !!(this.filterUser || this.filterText);
    repo.message?.findSubscribe(
      {
        ...(this.filterUser ? { "senderID": this.filterUser } : {}),
        ...(this.filterText ? { "body": ["LIKE", `%${escapeLike(this.filterText)}%`] } : {}),
      },
      [
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
          // cb: (q) => q.related("topicMessage" as never),
        }
      ],
      { "timestamp": "desc" },
      this.pageSize,
      this.startRecord || undefined,
    )
    // .pipe(throttleTime(200))
    .subscribe((messages) => {
      console.log('Messages:', messages);
      // this.displaymessages = messages as DisplayMessage[];
      this.displaymessages = messages.map((message) => {
        const m = message as DisplayMessage;
        const messageView = m.messageView || [];
        const topicMessage = m.topicMessage || [];
        const topicMessageCount = topicMessage.length;
        const messageViewCount = messageView.length;
        const messageLikeCount = messageView.filter((view) => view.like).length;
        const messageReplyCount = 0; // TODO: implement reply count
        const messageRepostCount = 0; // TODO: implement repost count
        return {
          ...m,
          topicMessageCount,
          messageViewCount,
          messageReplyCount,
          messageRepostCount,
          messageLikeCount,
        };
      });
      // @TODO: Notify Angular that the data has changed
      this.changeDetectorRef.detectChanges();
      // setTimeout(() => {
      // this.batchMessageView();
      // }, 2000);
      this.messagesLoaded.next(true);
    })

    this.messagesLoaded.pipe(
      filter((loaded) => loaded),
      // throttleTime(2000),
      auditTime(2000),
      take(1),
    )
    .subscribe(() => {
      console.log('Messages Loaded');
      this.batchMessageView();
    });
  }

  messagesLoaded: BehaviorSubject<boolean> = new BehaviorSubject(false);
  filterUser: string = "";
  filterText: string = "";
  hasFilters: boolean = false;
  displaymessages = [] as DisplayMessage[];
  openMyEntityView() {
    const modalRef = this.modalService.open(MyEntityViewComponent, { size: 'lg' });
    const inst = (modalRef.componentInstance as MyEntityViewComponent)
    inst.inputValues = {
      entityId: '',
      type: 'message',
      data: null,
      errors: [],
      permissions: ['create'],
    };
    modalRef.shown.subscribe(() => {
      console.log('Modal shown');
    });
  }

  setFilterUser(filterUser: string) {
    this.filterUser = filterUser;
    this.triggerFetch();
  }

  setFilterText(filterText: string) {
    this.filterText = filterText;
    this.triggerFetch();
  }

  inspect = async () => {
    alert("Open dev tools console tab to view inspector output.");
    const inspector = await this.zeroService.getZero().inspect();
    const client = inspector.client;

    const style =
      "background-color: darkblue; color: white; font-style: italic; font-size: 2em;";
    console.log("%cPrinting inspector output...", style);
    console.log(
      "%cTo see pretty tables, leave devtools open, then press 'Inspect' button in main UI again.",
      style
    );
    console.log(
      "%cSorry this is so ghetto I was too tired to make a debug dialog.",
      style
    );

    console.log("client:");
    console.log(client);
    console.log("client group:");
    console.log(client.clientGroup);
    console.log("client map:");
    console.log(await client.map());
    for (const tableName of Object.keys(schema.tables)) {
      console.log(`table ${tableName}:`);
      console.table(await client.rows(tableName));
    }
    console.log("client queries:");
    console.table(await client.queries());
    console.log("client group queries:");
    console.table(await client.clientGroup.queries());
    console.log("all clients in group");
    console.table(await client.clientGroup.clients());
  };

  editMessage(messageId: string) {
    console.log("Edit message", messageId);
    const message = this.allMessages?.find((message) => message.id === messageId);
    if (!message) {
      console.error("Message not found", messageId);
      return;
    }
    const currentUserIsOwner = this.userID === message.senderID;
    const permissions: EntityViewPermission[] = currentUserIsOwner ? ['edit', 'delete'] : ['view'];
    const modalRef = this.modalService.open(MyEntityViewComponent, { size: 'lg' });
    const inst = (modalRef.componentInstance as MyEntityViewComponent)
    inst.inputValues = {
      entityId: messageId,
      type: 'message',
      data: null,
      errors: [],
      permissions,
    };
    modalRef.shown.subscribe(() => {
      console.log('Modal shown');
    });
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

  messageShape(
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

  newMessage = "";
  createMessage() {
    repo.message?.create(this.messageShape(this.mediums![0].id, this.userID || "", this.newMessage))
    .then(() => {
      console.log('Message created');
      this.newMessage = "";
    })
    .catch((error) => {
      console.error('Error creating message:', error);
    });
  }

  /**
   * Posts this message to your timeline.
   * NOTE: A Repost will either use the Message ID in the new Parent ID field, or the Parent ID (if it was set) of the original message.
   * @param messageId
   */
  repostMessage(messageID: string) {
    const message = this.allMessages?.find((message) => message.id === messageID);
    if (!message) {
      console.error("Message not found", messageID);
      return;
    }
    const currentUserIsOwner = this.userID === message.senderID;
    // const newParentID = message.parentID || message.id;
    // console.log("Repost message", newParentID);
    // repo.message?.create(this.messageShape(this.mediums![0].id, this.userID || "", "Repost: " + newParentID))
    // .then(() => {
    //   console.log('Message created');
    //   this.newMessage = "";
    // })
    // .catch((error) => {
    //   console.error('Error creating message:', error);
    // });
  }

  likeMessage(messageID: string) {
    const message = this.allMessages?.find((message) => message.id === messageID);
    if (!message) {
      console.error("Message not found", messageID);
      return;
    }
    repo.messageView?.update(messageID, {
      userID: this.userID,
      messageID,
      like: true,// TODO: implement toggle
      likeTimestamp: new Date().getTime(),
    })
    .then(() => {
      console.log('Message Liked');
    })
    .catch((error) => {
      console.error('Error Liking message:', error);
    });
  }

  replyMessage(messageID: string) {
    const message = this.allMessages?.find((message) => message.id === messageID);
    if (!message) {
      console.error("Message not found", messageID);
      return;
    }
    const currentUserIsOwner = this.userID === message.senderID;
    // const newParentID = message.parentID || message.id;
    // console.log("Repost message", newParentID);
    // repo.message?.create(this.messageShape(this.mediums![0].id, this.userID || "", "Repost: " + newParentID))
    // .then(() => {
    //   console.log('Message created');
    //   this.newMessage = "";
    // })
    // .catch((error) => {
    //   console.error('Error creating message:', error);
    // });
  }

  bookmarkMessage(messageID: string) {
    const message = this.allMessages?.find((message) => message.id === messageID);
    if (!message) {
      console.error("Message not found", messageID);
      return;
    }
    repo.messageView?.update(messageID, {
      userID: this.userID,
      messageID,
      bookmark: true,
      bookmarkTimestamp: new Date().getTime(),
    })
    .then(() => {
      console.log('Message Bookmarked');
    })
    .catch((error) => {
      console.error('Error Bookmarking message:', error);
    });
  }

  isBookmarked(messageID: string) {
    const message = this.displaymessages?.find((message) => message.id === messageID);
    if (!message) {
      // console.error("Message not found", messageID);
      return false;
    }
    const messageView = message.messageView.find((view) => view.userID === this.userID);
    if (!messageView) {
      // console.error("MessageView not found", messageID);
      return false;
    }
    return messageView.bookmark;
  }

  shareMessage(messageID: string) {
    console.log("Share message", messageID);
  }

  /**
   * Upsert "View" Timestamps for set of messages
   * @TODO: check filtering - must call this manually for now as this could result in infinite loop
   */
  batchMessageView(){
    console.log('Batch Message View');
    console.log('User ID:', this.userID);
    if(this.userID === 'anon') return;
    repo.messageView?.batchUpsert(
      this.displaymessages
      .filter((message) => message.messageView.every(mv => mv.userID !== this.userID))
      .map((message) => {
        return {
          userID: this.userID,
          messageID: message.id,
          timestamp: new Date().getTime(),
        }
      })
    )
    .then(() => {
      console.log('Messages Batch Upserted');
    }
    )
    .catch((error) => {
      console.error('Error Batch Upserting:', error);
    }
    );
  }

  trackByFn(index: number, item: DisplayMessage) {
    return item.id;
  }
  trackByFnMedium(index: number, item: Medium) {
    return item.id;
  }
  trackByFnUser(index: number, item: User) {
    return item.id;
  }
  trackByFnTopic(index: number, item: Topic) {
    return item.id;
  }
  trackByFnTopicMessage(index: number, item: TopicMessage) {
    return item.topicID + item.messageID;
  }
  trackByFnMessageView(index: number, item: MessageView) {
    return item.userID + item.messageID;
  }
}
