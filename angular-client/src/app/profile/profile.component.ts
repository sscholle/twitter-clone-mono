import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { ZeroService } from 'zero-angular';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Medium, Message, Schema, Topic, User } from '../util/schema';
import { CommonModule } from '@angular/common';
import { QueryConfig } from '../util/ZeroRepository';
import { MessageList } from '../components/message-list/message-list.component';
import { NewMessageComponent } from '../components/new-message/new-message.component';
import { WhoToFollowComponent } from '../messages/who-to-follow/who-to-follow.component';

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
  users: User[] = [];
  topics: Topic[] = [];
  mediums: Medium[] | null = null;
  user: User | null = null;
  myMessges: Message[] | null = null;

  ngOnInit(): void {
    // Fetch user data
    // if (this.userID === "anon") {
    //   console.log("User is anonymous");
    // } else {
    //   repo.user?.findOne(this.userID)
    //   .then((user) => {
    //     console.log('ProfileComponent: User:', user);
    //     this.user = user as User;
    //   });
    // }

    // // Fetch all users
    // repo.user?.find()
    //   .then((users) => {
    //     console.log('Users:', users);
    //     this.users = users as User[];
    //   });

    // // Fetch all topics
    // repo.topic?.find()
    //   .then((topics) => {
    //     console.log('Topics:', topics);
    //     this.topics = topics as Topic[];
    //   });

    // // Fetch all mediums
    // repo.medium?.find()
    //   .then((mediums) => {
    //     console.log('Mediums:', mediums);
    //     this.mediums = mediums as Medium[];
    //   });

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
