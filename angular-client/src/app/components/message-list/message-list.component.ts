import { AfterViewInit, ChangeDetectorRef, Component, contentChild, ContentChild, ContentChildren, Directive, ElementRef, EmbeddedViewRef, EventEmitter, inject, Injector, Input, OnChanges, OnInit, Output, Query, QueryList, SimpleChanges, TemplateRef, ViewChildren } from '@angular/core';
import { Medium, Message, MessageView, schema, Schema, Topic, TopicMessage, User } from '../../util/schema';
import { CommonModule } from '@angular/common';
import { NgbDropdownModule, NgbModal, NgbPaginationModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { ZeroService } from 'zero-angular';
import { DisplayMessage } from '../../shared/DisplayMessage';
import { auditTime, BehaviorSubject, filter, Observable, take } from 'rxjs';
import { QueryConfig } from '../../util/ZeroRepository';
import { allRepositories as repo } from '../../shared/allRepos';
import { MyEntityViewComponent } from '../../my-entity-view/my-entity-view.component';
import { EntityViewPermission } from '../../my-entity-view/machine';
import { randID } from '../../util/rand';


@Directive({
  selector: '[tcMessageItem]',
  standalone: true
})
export class MessageItemDirective{
  constructor(public templateRef: TemplateRef<DisplayMessage>) {
  }
  // static ngTemplateContextGuard(dir: MessageItemDirective, ctx: any): ctx is TemplateRef<DisplayMessage> {
  //   return true;
  // }
}

@Component({
  selector: 'tc-message-list',
  imports: [CommonModule, NgbPaginationModule, NgbDropdownModule, NgbTooltipModule],
  templateUrl: './message-list.component.html',
  styleUrl: './message-list.component.scss'
})
export class MessageList implements OnInit, AfterViewInit, OnChanges {
  @Input() queryConfig: QueryConfig<Schema, Message> | undefined = undefined;
  @Input() dataMap: (res: any[]) => DisplayMessage[] = (res: any[]) => res as DisplayMessage[];
  @Input() messages: DisplayMessage[] = [];
  // @Input() messageQuery: Observable<DisplayMessage[]> | null = null;
  // messages: DisplayMessage[] = [];


  ngAfterViewInit(): void {
    console.log("messageItemTemplate", this.messageItemTemplate);
  }
  // @Output() replyToMessage = new EventEmitter<Message>();
  // @Output() repostMessage = new EventEmitter<Message>();
  // @Output() likeMessage = new EventEmitter<Message>();
  // @Output() bookmarkMessage = new EventEmitter<Message>();
  // @Output() deleteMessage = new EventEmitter<Message>();
  // @Output() editMessage = new EventEmitter<Message>();
  // messageItemTemplate = contentChild.required(MessageItemDirective);
  @ContentChild(MessageItemDirective) messageItemTemplate: MessageItemDirective | null = null;
  // @ViewChildren('messageItemMedium') messageItemMediums: any;

  zeroService = inject(ZeroService<Schema>);
  modalService = inject(NgbModal);
  changeDetectorRef = inject(ChangeDetectorRef);
  userID: string = this.zeroService.getZero().userID;
  mediums: Medium[] | null = null;

  ngOnInit(): void {
    repo.medium?.find()
    .then((mediums) => {
      console.log('Mediums:', mediums);
      this.mediums = mediums as Medium[];
    });
    if (!this.queryConfig) {
      console.warn('No messageQuery provided, using default query');
      if(!this.messages) {
        console.warn('No messageQuery provided, using default query');
      }
      console.log('Messages:', this.messages);
    } else {

      this.triggerFetch();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if( changes['queryConfig'] && changes['queryConfig'].currentValue) {
      console.log('Query Config Changed:', changes['queryConfig'].currentValue);
      // If queryConfig has changed, we need to re-fetch the messages
      this.triggerFetch();
    }
      // console.log('Query Config Changed:', changes['queryConfig']);
      // changes.queryConfig && this.triggerFetch();
  }

  triggerFetch(){
    repo.message?.findSubscribe(
      this.queryConfig?.queryParams || {},
      this.queryConfig?.relations || [],
      this.queryConfig?.orderBy || { timestamp: 'desc' },
      this.pageSize,
      this.startRecord || undefined,
    )
    .subscribe((messages) => {
      console.log('Messages:', messages);
      // this.displaymessages = messages as DisplayMessage[];
      if(this.dataMap) {
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
  pageSize = 10;// - Number of elements/items per page.
  page = 1;//- The current page.
  startRecord: DisplayMessage | null = null;// - The first record of the current page.

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
  batchMessageView(){
    console.log('Batch Message View');
    console.log('User ID:', this.userID);
    if(this.userID === 'anon') return;
    repo.messageView?.batchUpsert(
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
    }
    )
    .catch((error) => {
      console.error('Error Batch Upserting:', error);
    }
    );
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
    repo.messageView?.update({
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
    repo.messageView?.update({
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
}
