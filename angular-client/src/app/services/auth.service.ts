import { inject, Injectable } from "@angular/core";

import { Schema as RSchema} from "@rocicorp/zero";
import { Follower, Medium, Message, MessageView, Schema, Topic, User } from "../util/schema";
import Cookies from "js-cookie";
import { RepoService } from "./repo.service";
import { ZeroService } from "zero-angular";
import { BehaviorSubject, Observable, Subject } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class AuthService<S extends RSchema = Schema> {
  zeroService = inject(ZeroService<Schema>);
  repoService  = inject(RepoService<S>);
  topicRepo = this.repoService.topicRepo;
  userRepo = this.repoService.userRepo;
  mediumRepo = this.repoService.mediumRepo;
  messageRepo = this.repoService.messageRepo;
  followerRepo = this.repoService.followerRepo;
  messageViewsRepo = this.repoService.messageViewsRepo;

  get userID(): string {
    return this.zeroService.getZero().userID || 'anon'; // Default to 'anon' if userID is not set
  }
  user: User | null = null; // Store user details if needed
  followingUsers: User[] = []; // Store following users if needed
  jwt: string | null = null; // Store JWT token if needed

  user$: Subject<User | null> = new Subject<User | null>(); // Observable for user data
  constructor() {
    if(this.isLoggedIn()) {
      this.getUser(this.zeroService.getZero().userID || '')
        .then(user => {
          if (user) {
            this.user = user;
            this.user$.next(this.user); // Emit user data
            // this.userID = user.id; // Assuming User has an 'id' property
            console.log("User Detail fetched:", this.user);
          } else {
            console.warn("User not found.");
          }
        })
        .catch(error => {
          console.error("Error fetching user:", error);
        });
    } else {
      console.log("User is not logged in.");
      this.user$.next(null); // Emit null if not logged in
      this.user = null; // Reset user data
    }
  }

  // Method to check if the user is logged in
  isLoggedIn(): boolean {
    // this.zeroService.getZero().userID
    // this.userID = this.zeroService.getZero().userID;
    return this.userID !== 'anon';
  }

  // Method to log out the user
  logout(): void {
    Cookies.remove('jwt'); // Remove JWT cookie
    this.user = null; // Reset user data
    this.user$.next(null); // Emit null to notify subscribers
  }

  async login() {
      const res = await fetch('http://localhost:5173/api/login', {
        credentials: 'include',
      });
      return res
  }

  getUser(userID: string): Promise<User | null> {
    // return repo.user?.findOne(userID) || Promise.resolve(null);
    if (this.userRepo) {
      return this.userRepo.findOne(userID);
    } else {
      console.warn("User repository is not available.");
      return Promise.resolve(null);
    }
  }
}
