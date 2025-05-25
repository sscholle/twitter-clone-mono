import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Output } from "@angular/core";
import { FormsModule } from "@angular/forms";

@Component({
  selector: "app-new-message",
  imports: [CommonModule, FormsModule],
  template: `
    <div class="card bg-glass text-white shadow mb-3">
      <div class="card-body">
        <textarea class="form-control bg-transparent text-white border-0" rows="3" placeholder="What's happening?" [(ngModel)]="newMessage"></textarea>
        <div class="d-flex justify-content-end mt-2">
          <button class="btn btn-outline-light" (click)="createMessage()">Tweet</button>
        </div>
      </div>
    </div>`
})
export class NewMessageComponent {
  newMessage: string = '';
  @Output() onMessageCreate = new EventEmitter<string>();
  createMessage() {
    if (this.newMessage.trim()) {
      // Here you would typically call a service to create the message
      console.log('New message created:', this.newMessage);
      this.onMessageCreate.emit(this.newMessage); // Emit the new message
      this.newMessage = ''; // Clear the input after creating the message
    } else {
      console.warn('Message cannot be empty');
    }
  }
}
