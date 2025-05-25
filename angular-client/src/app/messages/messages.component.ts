import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CardComponent } from '../components/card.component';
import { Follower, Medium, Message, Schema, Topic, User } from '../util/schema';
import { allRepositories as repo } from '../shared/allRepos';
import { CommonModule } from '@angular/common';
import { ZeroService } from 'zero-angular';
import { MessageItemDirective, MessageList } from '../components/message-list/message-list.component';
import { NgbModal, NgbPaginationModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { QueryConfig } from '../util/ZeroRepository';
import { WhoToFollowComponent } from './who-to-follow/who-to-follow.component';

interface FollowerUser extends Follower {
  user: User
}
@Component({
  selector: 'tc-messages',
  imports: [CommonModule, RouterModule, CardComponent, MessageList, NgbPaginationModule, MessageItemDirective, NgbTooltipModule, WhoToFollowComponent],
  templateUrl: './messages.component.html',
  styleUrl: './messages.component.scss'
})
export class MessagesComponent {
  zeroService = inject(ZeroService<Schema>);
  userID: string = this.zeroService.getZero().userID;// TODO: store this in a service
  modalService = inject(NgbModal);
  changeDetectorRef = inject(ChangeDetectorRef);
  users: User[] = [];
  topics: Topic[] = [];
  mediums: Medium[] | null = null;
  user: User | null = null;
  allMessages: Message[] | null = null;
  followingUsers: FollowerUser[] = [];

  ngOnInit(): void {
    // this.themeService.themeChanges().subscribe(theme => {
    //   if (theme.oldValue) {
    //     this.renderer.removeClass(document.body, theme.oldValue);
    //   }
    //   this.renderer.addClass(document.body, theme.newValue);
    // // })
    // repo.message?.find({}, ['users', 'mediums'])
    // .then((messages) => {
    //   console.log('Messages:', messages);
    //   this.tweets = messages as Message[];
    // });
    repo.user?.find()
    .then((users) => {
      console.log('Users:', users);
      this.users = users as User[];
    });
    repo.topic?.findSubscribe()
    .subscribe((topics) => {
      console.log('Topics:', topics);
      this.topics = topics as Topic[];
    });
    repo.follower?.findSubscribe(
      {
        "followerID": this.userID || '',
      },
      [{
        table: "user",
        cb: (q) => q,
      }],
    )
    .subscribe((followers) => {
      console.log('Followers:', followers);
      this.followingUsers = followers as FollowerUser[];
      // Regenerate the Messages query Config
      this.triggerFetch();
    });
  }

  filterByTopic(topicId: string) {
    console.log('Filtering by topic:', topicId);
    // repo.message?.find({ topicID: topicId })
    // .then((messages) => {
    //   console.log('Filtered Messages:', messages);
    //   this.tweets = messages as Message[];
    // });
  }

  queryConfig: QueryConfig<Schema, Message> | undefined = undefined;
  triggerFetch(){
    // this.hasFilters = !!(this.filterUser || this.filterText);
    this.queryConfig = {
      queryParams: {
        // "senderID": ["IN", this.followingUsers.map(fu => fu.userID)],
        // use this for message body text search
        // ...(this.filterText ? { "body": ["LIKE", `%${escapeLike(this.filterText)}%`] } : {}),
      },
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
    }
  }
}
