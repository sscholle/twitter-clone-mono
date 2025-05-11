import { Component, inject, OnInit } from '@angular/core';
import { Medium, Message, schema, Schema, Topic, TopicMessage, User } from '../util/schema';
import { MyEntityViewComponent } from '../my-entity-view/my-entity-view.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModal, NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { ZeroService } from 'zero-angular';
import { escapeLike } from '@rocicorp/zero';
import Cookies from "js-cookie";
import { EntityViewPermission } from '../my-entity-view/machine';
import { allRepositories as repo } from '../shared/allRepos';
import { randID } from '../util/rand';

interface TopicMessageWithTopic extends TopicMessage {
  topic: Topic
}
interface DisplayMessage extends Message {
  sender: User,
  medium: Medium
  topicMessage?: TopicMessageWithTopic[]
}
@Component({
  selector: 'components-messages',
  imports: [CommonModule, FormsModule, NgbPaginationModule],
  templateUrl: './messages.component.html',
  styleUrl: './messages.component.scss'
})
export class MessagesComponent implements OnInit {
  zeroService = inject(ZeroService<Schema>);
  // zeroQuery = inject(QueryService);
	modalService = inject(NgbModal);

  users: User[] | null = null;
  mediums: Medium[] | null = null;
  allMessages: Message[] | null = null;
  userID: string | null = this.zeroService.getZero().userID;// TODO: store this in a service
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
        }
      ],
      { "timestamp": "desc" },
      this.pageSize,
      this.startRecord || undefined,
    )
    .subscribe((messages) => {
      console.log('Messages:', messages);
      this.displaymessages = messages as DisplayMessage[];
    })
  }

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

  toggleLogin = async () => {
    if (this.zeroService.getZero().userID === "anon") {
      await fetch("http://localhost:5173/api/login", { credentials: "include", mode: "no-cors" });
    } else {
      Cookies.remove("jwt");
    }
    location.reload();
  };

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
  pageSize = 20;// - Number of elements/items per page.
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
}
