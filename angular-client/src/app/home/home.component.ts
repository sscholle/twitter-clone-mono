import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CardComponent } from '../components/card.component';
import { Follower, Medium, Message, MessageView, Schema, Topic, TopicMessage, User } from '../util/schema';
import { allRepositories as repo } from '../shared/allRepos';
import { CommonModule } from '@angular/common';
import { ZeroService } from 'zero-angular';
import { MessageItemDirective, MessageList } from '../components/message-list/message-list.component';
import { NgbModal, NgbPaginationModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { DisplayMessage, messageShape } from '../shared/DisplayMessage';
import { QueryConfig } from '../util/ZeroRepository';
import { WhoToFollowComponent } from '../messages/who-to-follow/who-to-follow.component';
import { NewMessageComponent } from "../components/new-message/new-message.component";
import { MessageService } from '../services/message.service';

interface FollowerUser extends Follower {
  user: User
}
@Component({
  selector: 'components-home',
  imports: [CommonModule, RouterModule, CardComponent, MessageList, NgbPaginationModule, MessageItemDirective, NgbTooltipModule, WhoToFollowComponent, NewMessageComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  zeroService = inject(ZeroService<Schema>);
  userID: string = this.zeroService.getZero().userID;// TODO: store this in a service
  modalService = inject(NgbModal);
  changeDetectorRef = inject(ChangeDetectorRef);
  messageService = inject(MessageService);
  users: User[] = [];
  topics: Topic[] = [];
  mediums: Medium[] | null = null;
  user: User | null = null;
  allMessages: Message[] | null = null;
  followingUsers: FollowerUser[] = [];

  ngOnInit(): void {
    this.messageService.observeTopics()
    .subscribe((topics) => {
      console.log('Topics:', topics);
      this.topics = topics as Topic[];
    });
    this.messageService.getMediums()
    .then((mediums) => {
      console.log('Mediums:', mediums);
      this.mediums = mediums as Medium[];
    });
    this.messageService.observeFollowers(this.userID)
    .subscribe((followers) => {
      console.log('Followers:', followers);
      this.followingUsers = followers as FollowerUser[];
      // Regenerate the Messages query Config
      this.triggerFetch();
    });

    // THEME CHANGE HANDLER
    // this.themeService.themeChanges().subscribe(theme => {
    //   if (theme.oldValue) {
    //     this.renderer.removeClass(document.body, theme.oldValue);
    //   }
    //   this.renderer.addClass(document.body, theme.newValue);
    // // })
  }

  filterByTopic(topicId: string) {
    console.log('Filtering by topic:', topicId);
    // repo.message?.find({ topicID: topicId })
    // .then((messages) => {
    //   console.log('Filtered Messages:', messages);
    //   this.tweets = messages as Message[];
    // });
  }

  canFollowUser(userId: string): boolean {
    return this.userID !== userId && this.isNotFollowingUser(userId);
  }

  isNotFollowingUser(userId: string): boolean {
    return !this.followingUsers.some((follower) => follower.userID === userId);
  }

  followUser(userId: string) {
    this.messageService.followUser(userId, this.userID)
    .then((result) => {
      console.log('Followed user:', result);
    }).catch((error) => {
      console.error('Error following user:', error);
    });
    console.log('Following user:', userId);
  }

  unFollowUser(userId: string) {
    this.messageService.unFollowUser(userId, this.userID)
    .then((result) => {
      console.log('Unfollowed user:', result);
    }).catch((error) => {
      console.error('Error unfollowing user:', error);
    });
    console.log('Unfollowing user:', userId);
  }

  queryConfig: QueryConfig<Schema, Message> | undefined = undefined;
  triggerFetch(){
    // this.hasFilters = !!(this.filterUser || this.filterText);
    this.queryConfig = {
      queryParams: {
        "senderID": ["IN", this.followingUsers.map(fu => fu.userID)],
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

  createMessage(messageBody: string) {
    repo.message?.create(messageShape(this.mediums![0].id, this.userID || "", messageBody))
    .then(() => {
      console.log('Message created');
    })
    .catch((error) => {
      console.error('Error creating message:', error);
    });
  }

}
