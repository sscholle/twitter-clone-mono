import { ChangeDetectorRef, Component, ContentChild, Directive, inject, Input, OnChanges, OnInit, SimpleChanges, TemplateRef } from '@angular/core';
import { Medium, Message, MessageView, schema, Schema, Topic, TopicMessage, User } from '../../util/schema';
import { CommonModule } from '@angular/common';
import { NgbDropdownModule, NgbModal, NgbPaginationModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { ZeroService } from 'zero-angular';
import { DisplayMessage } from '../../shared/DisplayMessage';
import { auditTime, BehaviorSubject, filter, Subject, take } from 'rxjs';
import { QueryConfig } from '../../util/ZeroRepository';
import { MyEntityViewComponent } from '../../my-entity-view/my-entity-view.component';
import { EntityViewPermission } from '../../my-entity-view/machine';
import { MessageService } from '../../services/message.service';
// import { IInfiniteScrollEvent, InfiniteScrollDirective } from 'ngx-infinite-scroll';

@Directive({
  selector: '[tcMessageItem]',
  standalone: true
})
export class MessageItemDirective {
  constructor(public templateRef: TemplateRef<DisplayMessage>) {
  }
  // static ngTemplateContextGuard(dir: MessageItemDirective, ctx: any): ctx is TemplateRef<DisplayMessage> {
  //   return true;
  // }
}

@Component({
  selector: 'tc-message-list',
  imports: [CommonModule, NgbPaginationModule, NgbDropdownModule, NgbTooltipModule, MessageItemDirective],
  templateUrl: './message-list.component.html',
  styleUrl: './message-list.component.scss'
})
export class MessageList implements OnInit, OnChanges {
  @Input() queryConfig: QueryConfig<Schema, Message, 'message'> | undefined = undefined;
  @Input() dataMap: ((res: any[]) => DisplayMessage[]) | undefined = undefined;// = (res: any[]) => res as DisplayMessage[];
  @Input() messages: DisplayMessage[] = [];

  @ContentChild(MessageItemDirective) messageItemTemplate: MessageItemDirective | null = null;

  zeroService = inject(ZeroService<Schema>);
  modalService = inject(NgbModal);
  changeDetectorRef = inject(ChangeDetectorRef);
  messageService = inject(MessageService);
  userID: string = this.zeroService.getZero().userID;
  // mediums: Medium[] | null = null;
  allMessages: Message[] | null = null;
  ngOnInit(): void {

    this.queryChanged.pipe(
      // filter((queryConfig) => !!queryConfig),
      // auditTime(1000), // Debounce the query changes
      // take(1), // Take only the first query change
    ).subscribe((queryConfig) => {
      console.log('Query Changed:', queryConfig);
      this.queryConfig = queryConfig;
      this.triggerFetch();
    });


    // this.messageService.getMediums()
    //   .subscribe((mediums) => {
    //     console.log('Mediums:', mediums);
    //     this.mediums = mediums as Medium[];
    //   });

    if (!this.queryConfig) {
      console.warn('No messageQuery provided, using default query');
      if (!this.messages) {
        console.warn('No messageQuery provided, using default query');
      }
      console.log('MessageList: Messages:', this.messages);
    } else {
      console.log('MessageList: Query Config:', this.queryConfig);
      // this.triggerFetch();
      this.queryChanged.next(this.queryConfig);
    }

    this.messageService.observeMessages(
      {
        queryParams: this.queryConfig?.queryParams || {},
        relations: [],
        orderBy: this.queryConfig?.orderBy || { timestamp: 'desc' },
      }
    ).subscribe((messages) => {
      console.log('ALL Messages:', messages);
      this.allMessages = messages as Message[];
    });

  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['queryConfig']) {
      console.log('Query Config Changed:', changes['queryConfig'].currentValue);
      // If queryConfig has changed, we need to re-fetch the messages
      // this.triggerFetch();
      this.queryChanged.next(changes['queryConfig'].currentValue);
    }
    // console.log('Query Config Changed:', changes['queryConfig']);
    // changes.queryConfig && this.triggerFetch();
  }

  queryChanged: Subject<QueryConfig<Schema, Message, 'message'>> = new Subject();

  triggerFetch() {
    if(!this.queryConfig) {
      console.warn('No queryConfig provided, cannot fetch messages');
      this.messages = [];
      return;
    }
    this.messageService.observeMessages(
      this.queryConfig
    ).subscribe((messages) => {
      console.log('MessageList: ', messages);
      // this.displaymessages = messages as DisplayMessage[];
      if (this.dataMap) {
        this.messages = this.dataMap(messages);
      } else {
        this.messages = messages.map((message) => {
          const m = message as DisplayMessage;
          const messageView = m.messageView || [];
          const topicMessage = m.topicMessage || [];
          const topicMessageCount = topicMessage.length;
          const messageViewCount = messageView.length;
          const messageLikeCount = messageView.filter((view) => view.like).length;
          const messageReplyCount = 0; // TODO: implement reply count
          const messageRepostCount = 0; // TODO: implement repost count
          // console.log('Message:', m)
          return {
            ...m,
            topicMessageCount,
            messageViewCount,
            messageReplyCount,
            messageRepostCount,
            messageLikeCount,
          };
        });
      }

      // @TODO: Notify Angular that the data has changed
      this.changeDetectorRef.detectChanges();
      this.messagesLoaded.next(true);
    })

    // DELAY Updating Message Views after messages are loaded
    this.messagesLoaded.pipe(
      filter((loaded) => loaded),
      auditTime(2000),
      take(1),
    )
    .subscribe(() => {
      console.log('Messages Loaded');
      this.batchMessageView();
    });
  }
  messagesLoaded: BehaviorSubject<boolean> = new BehaviorSubject(false);

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

  // setFilterUser(filterUser: string) {
  //   this.filterUser = filterUser;
  //   this.triggerFetch();
  // }

  // setFilterText(filterText: string) {
  //   this.filterText = filterText;
  //   this.triggerFetch();
  // }

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
    const message = this.messages?.find((message) => message.id === messageId);
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
  pageSize = 100;// - Number of elements/items per page.
  page = 1;//- The current page.
  startRecord: DisplayMessage | null = null;// - The first record of the current page.

  /**
   * Note: This is a manual pagination trigger - has issue when pagination backwards (posted on ZeroBug tracker; https://bugs.rocicorp.dev/issue/3880 )
   * @param page
   */
  triggerPagination(page: number) {
    this.page = page;
    this.startRecord = page === 1 ? null : this.messages[this.messages.length - 1];
    console.log("triggerPagination", this.page, this.startRecord);
    this.triggerFetch();
  }

  /**
   * Upsert "View" Timestamps for set of messages
   * @TODO: check filtering - must call this manually for now as this could result in infinite loop
   */
  batchMessageView() {
    console.log('Batch Message View');
    console.log('User ID:', this.userID);
    if (this.userID === 'anon') return;
    if (!this.messages || this.messages.length === 0) {
      console.warn('No messages to batch upsert');
      return;
    }
    this.messageService.batchMessageView(
      this.messages
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
      })
      .catch((error) => {
        console.error('Error Batch Upserting:', error);
      });
  }


  /**
   * Posts this message to your timeline.
   * NOTE: A Repost will either use the Message ID in the new Parent ID field, or the Parent ID (if it was set) of the original message.
   * @param messageId
   */
  repostMessage(messageID: string) {
    const message = this.messages?.find((message) => message.id === messageID);
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
    const message = this.messages?.find((message) => message.id === messageID);
    if (!message) {
      console.error("Message not found", messageID);
      return;
    }
    const isLiked = this.isLiked(messageID);
    this.messageService.likeMessage(messageID, this.userID, !isLiked)
      .then(() => {
        console.log('Message Liked');
      })
      .catch((error) => {
        console.error('Error Liking message:', error);
      });
  }

  isLiked(messageID: string) {
    const message = this.messages?.find((message) => message.id === messageID);
    if (!message) {
      // console.error("Message not found", messageID);
      return false;
    }
    const messageView = message.messageView.find((view) => view.userID === this.userID);
    if (!messageView) {
      // console.error("MessageView not found", messageID);
      return false;
    }
    return messageView.like;
  }

  replyMessage(messageID: string) {
    const message = this.messages?.find((message) => message.id === messageID);
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
    const message = this.messages?.find((message) => message.id === messageID);
    if (!message) {
      console.error("Message not found", messageID);
      return;
    }
    const isBookmarked = this.isBookmarked(messageID);
    this.messageService.bookmarkMessage(messageID, this.userID, !isBookmarked)
    .then(() => {
      console.log('Message Bookmarked')
    }
    ).catch((error) => {
      console.error('Error Bookmarking message:', error);
    });
  }

  isBookmarked(messageID: string) {
    const message = this.messages?.find((message) => message.id === messageID);
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


  // INFINITE SCROLL EXPERIMENTAL

  // sum = 10;
  // throttle = 300;
  // scrollDistance = 2;
  // scrollUpDistance = 2;
  // direction = "";
  // onScrollDown(ev: IInfiniteScrollEvent) {
  //   console.log("scrolled down!!", ev);

  //   // add another 20 items
  //   const start = this.sum;
  //   this.sum += 20;
  //   this.appendItems(start, this.sum);

  //   this.direction = "down";
  // }

  // onUp(ev: IInfiniteScrollEvent) {
  //   console.log("scrolled up!", ev);
  //   const start = this.sum;
  //   this.sum += 20;
  //   this.prependItems(start, this.sum);

  //   this.direction = "up";
  // }

  // array = [];
  // addItems(_startIndex: number, endIndex: number, _method: string) {
  //   for (let i = 0; i < this.sum; ++i) {
  //     (this.array as any)[_method]([i, " ", "data"].join(""));
  //   }
  // }

  // appendItems(startIndex: number, endIndex: number) {
  //   this.addItems(startIndex, endIndex, "push");
  // }

  // prependItems(startIndex: number, endIndex: number) {
  //   this.addItems(startIndex, endIndex, "unshift");
  // }


}
