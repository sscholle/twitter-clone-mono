import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CardComponent } from '../components/card.component';
import { Follower, Medium, Message, MessageView, Schema, Topic, TopicMessage, User } from '../util/schema';
import { CommonModule } from '@angular/common';
import { MessageItemDirective, MessageList } from '../components/message-list/message-list.component';
import { NgbModal, NgbPaginationModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { DisplayMessage, messageShape } from '../shared/DisplayMessage';
import { QueryConfig } from '../util/ZeroRepository';
import { WhoToFollowComponent } from '../messages/who-to-follow/who-to-follow.component';
import { NewMessageComponent } from "../components/new-message/new-message.component";
import { MessageService } from '../services/message.service';
import { AuthService } from '../services/auth.service';
import { audit, debounceTime, interval, Subject } from 'rxjs';
import { ThemeService } from '../services/theme.service';

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
  authService = inject(AuthService);
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
    // .pipe(debounce())
    .subscribe((topics) => {
      console.log('Topics:', topics);
      this.topics = topics as Topic[];
    });
    this.messageService.getMediums()
    .subscribe((mediums) => {
      console.log('Mediums:', mediums);
      this.mediums = mediums as Medium[];
    });
    if(this.authService.isLoggedIn() && this.authService.userID) {
      this.messageService.observeFollowers(this.authService.userID)
      .subscribe((followers) => {
        this.followingUsers = followers as FollowerUser[];
        console.log('Following Users:', this.followingUsers);
        this.triggerFetch();
      });
    }

    // this.authService.getUser(this.authService.userID)
    // .then((user) => {
    //   console.log('User:', user);
    //   this.user = user as User;
    //   // this.changeDetectorRef.detectChanges();
    // })
    // .catch((error) => {
    //   console.error('Error fetching user:', error);
    // });
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

  get isLoggedIn() {
    return this.authService.isLoggedIn();
  }

  get userName() {
    return this.authService.user?.name || 'Guest';
  }

  canFollowUser(userId: string): boolean {
    return this.authService.userID !== userId && this.isNotFollowingUser(userId);
  }

  isNotFollowingUser(userId: string): boolean {
    return !this.followingUsers.some((follower) => follower.userID === userId);
  }

  followUser(userId: string) {
    this.messageService.followUser(userId, this.authService.userID || "")
    .then((result) => {
      console.log('Followed user:', result);
    }).catch((error) => {
      console.error('Error following user:', error);
    });
    console.log('Following user:', userId);
  }

  unFollowUser(userId: string) {
    this.messageService.unFollowUser(userId, this.authService.userID || "")
    .then((result) => {
      console.log('Unfollowed user:', result);
    }).catch((error) => {
      console.error('Error unfollowing user:', error);
    });
    console.log('Unfollowing user:', userId);
  }

  queryConfig: QueryConfig<Schema, Message, 'message'> | undefined = undefined;
  queryConfig$ = new Subject<any>();
  triggerFetch(){
    if(this.followingUsers.length === 0) {
      console.warn('No following users found, skipping message fetch.');
      this.queryConfig = undefined;
      return;
    }
    console.log('Triggering fetch for messages from following users:', this.followingUsers);
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
    // this.queryConfig$.next(this.queryConfig);
  }

  createMessage(messageBody: string) {
    this.messageService.postMessage(messageBody, this.authService.userID || "", this.mediums![0].id)
    // repo.message?.create(messageShape(this.mediums![0].id, this.authService.userID || "", messageBody))
    .then(() => {
      console.log('Message created');
    })
    .catch((error) => {
      console.error('Error creating message:', error);
    });
  }

}
