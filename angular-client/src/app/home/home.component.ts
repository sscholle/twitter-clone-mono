import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CardComponent } from '../components/card.component';
import { Follower, Medium, Message, MessageView, Schema, Topic, TopicMessage, User } from '../util/schema';
import { allRepositories as repo } from '../shared/allRepos';
import { CommonModule } from '@angular/common';
import { ZeroService } from 'zero-angular';
import { MessageItemDirective, MessageList } from '../components/message-list/message-list.component';
import { NgbModal, NgbPaginationModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { DisplayMessage } from '../shared/DisplayMessage';
import { QueryConfig } from '../util/ZeroRepository';

interface FollowerUser extends Follower {
  user: User
}
@Component({
  selector: 'components-home',
  imports: [CommonModule, RouterModule, CardComponent, MessageList, NgbPaginationModule, MessageItemDirective, NgbTooltipModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
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

    // lists all followed content - pass query to messages
    // configure messages to show only followed content


      // if(this.userID === "anon") {
      //   console.log("User is anonymous");
      // } else {
      //   console.log(repo.user);
      //   repo.user?.findOne(this.userID || "")
      //   .then((user) => {
      //     console.log('User:', user);
      //     this.user = user as User;
      //   });
      // }
      // repo.user?.find()
      // .then((users) => {
      //   console.log('Users:', users);
      //   this.users = users as User[];
      // });
      // repo.medium?.find()
      // .then((mediums) => {
      //   console.log('Mediums:', mediums);
      //   this.mediums = mediums as Medium[];
      // });
      // repo.message?.findSubscribe()
      // .subscribe((messages) => {
      //   console.log('Messages:', messages);
      //   this.allMessages = messages as Message[];
      // });
      // this.triggerFetch();



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

  canFollowUser(userId: string): boolean {
    return this.userID !== userId && this.isNotFollowingUser(userId);
  }
  isNotFollowingUser(userId: string): boolean {
    return !this.followingUsers.some((follower) => follower.userID === userId);
  }

  followUser(userId: string) {
    console.log('Following user:', userId);
    // Implement follow user logic here
    repo.follower?.create({
      userID: userId,
      followerID: this.userID,
    } as any).then((result) => {
      console.log('Followed user:', result);
    }
    ).catch((error) => {
      console.error('Error following user:', error);
    }
    );
  }

  unFollowUser(userId: string) {
    console.log('Unfollowing user:', userId);
    // Implement unfollow user logic here
    repo.follower?.delete({
      userID: userId,
      followerID: this.userID,
    } as any).then((result) => {
      console.log('Unfollowed user:', result);
    }
    ).catch((error) => {
      console.error('Error unfollowing user:', error);
    }
    );
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

  newMessage = "";

}
