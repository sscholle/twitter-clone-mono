import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { ZeroService } from 'zero-angular';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Medium, Message, Schema, Topic, User } from '../util/schema';
import { CommonModule } from '@angular/common';
import { QueryConfig } from '../util/ZeroRepository';
import { MessageList } from '../components/message-list/message-list.component';
import { NewMessageComponent } from '../components/new-message/new-message.component';
import { WhoToFollowComponent } from '../messages/who-to-follow/who-to-follow.component';
import { MessageService } from '../services/message.service';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, MessageList, NewMessageComponent, WhoToFollowComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  queryConfig: QueryConfig<Schema, Message> | undefined = undefined;
  zeroService = inject(ZeroService<Schema>);
  userID: string = this.zeroService.getZero().userID;// TODO: store this in a service
  modalService = inject(NgbModal);
  changeDetectorRef = inject(ChangeDetectorRef);
  messageService = inject(MessageService);
  users: User[] = [];
  topics: Topic[] = [];
  mediums: Medium[] | null = null;
  user: User | null = null;
  myMessges: Message[] | null = null;

  ngOnInit(): void {
    this.messageService.observeTopics()
      .subscribe((topics) => {
        console.log('Topics:', topics);
        this.topics = topics as Topic[];
      });
    this.queryConfig = {
      queryParams : { senderID: this.userID },
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
          // cb: (q) => q.related("topicMessage" as never),
        }
      ],
      orderBy: { "timestamp": "desc" },
    };
  }
}
