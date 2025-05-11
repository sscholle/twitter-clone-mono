import { Component } from "@angular/core";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"],
})
export class LoginComponent {
  constructor() {}

  ngOnInit(): void {
    // Initialize any necessary data or services here
  }

  onLogin(): void {
    // Handle login logic here
    console.log("Login button clicked");
  }
}
