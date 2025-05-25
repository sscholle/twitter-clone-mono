import { CommonModule } from "@angular/common";
import { Component, inject, OnInit } from "@angular/core";
import { Schema } from "@rocicorp/zero";
import { ZeroService } from "zero-angular";
import { Follower, User } from "../../util/schema";
import { allRepositories as repo } from '../../shared/allRepos';
import { NgbTooltipModule } from "@ng-bootstrap/ng-bootstrap";

interface FollowerUser extends Follower {
  user: User
}

@Component({
  selector: "app-who-to-follow",
  templateUrl: "./who-to-follow.component.html",
  // styleUrls: ["./who-to-follow.component.scss"]
  imports: [CommonModule, NgbTooltipModule],
})
export class WhoToFollowComponent implements OnInit {
  // This component is used to display a list of users to follow
  // It can be used in the home component or anywhere else

  zeroService = inject(ZeroService<Schema>);
  userID: string = this.zeroService.getZero().userID;// TODO: store this in a service
  users: User[] = [];
  // user: User | null = null;
  followingUsers: FollowerUser[] = [];

  ngOnInit(): void {
    repo.user?.find()
    .then((users) => {
      console.log('Users:', users);
      this.users = users as User[];
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
      // this.triggerFetch();
    });
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
}
