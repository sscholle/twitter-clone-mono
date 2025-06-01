import { inject, Injectable } from "@angular/core";
import { Schema as RSchema} from "@rocicorp/zero";
import { Schema, User } from "../util/schema";
import Cookies from "js-cookie";
import { RepoService } from "./repo.service";
import { ZeroService } from "zero-angular";
import { filter, interval, Subject, switchMap, take, tap } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class AuthService<TSchema extends RSchema = Schema> {
  zeroService = inject(ZeroService<TSchema>);
  repoService  = inject(RepoService<TSchema>);
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
    console.log("AuthService initialized");
  }

  async runAuth(): Promise<User | null> {
    console.log("Running AuthService", this.userID);
    if(this.isLoggedIn()) {
      try {
        const user = await this.getUser(this.userID);
        if (user) {
          this.user = user;
          this.user$.next(this.user); // Emit user data

          // this.userID = user.id; // Assuming User has an 'id' property
          console.log("User Detail fetched:", this.user);
        } else {
          console.warn("User not found.");
        }
        return user || null;
      } catch (error) {
        console.error("Error fetching user:", error);
        return null;
      }
    } else {
      console.log("User is not logged in.");
      this.user$.next(null); // Emit null if not logged in
      this.user = null; // Reset user data
      return Promise.resolve(null); // Return a resolved promise with null
    }
  }

  // Method to check if the user is logged in
  isLoggedIn(): boolean {
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

  getUser(userID: string): Promise<User | undefined> {
    // return repo.user?.findOne(userID) || Promise.resolve(null);
    if (this.userRepo) {
      console.log("Fetching user data for userID:", userID);

      // Query seems to fail if we don't wait for Zero to be online
      return interval(15) // Use timer to simulate delay
      .pipe(
        tap(t => console.log('Zero Online:', this.zeroService.getZero().online)),
        filter(t => this.zeroService.getZero().online),
        take(1), // Take the first emitted value
        switchMap(() => {
          console.log("Zero is online, fetching user data...");
          return this.userRepo.findOne(userID);
      })).toPromise()

    } else {
      console.warn("User repository is not available.");
      return Promise.resolve(undefined);
    }
  }
}
