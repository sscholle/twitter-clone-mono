import { Component } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-card',
  template: `
    <div
      class="card bg-body-tertiary "
      [@hoverState]="hover ? 'hovered' : 'default'"
      (mouseenter)="hover = true"
      (mouseleave)="hover = false"
    >
      <ng-content></ng-content>
    </div>
  `,
  styles: [
    `
      .card {
        transition: transform 0.3s;
      }
    `
  ],
  animations: [
    trigger('hoverState', [
      state('default', style({ transform: 'scale(1)' })),
      state('hovered', style({ transform: 'scale(1.1)' })),
      transition('default <=> hovered', animate('300ms ease-in-out'))
    ])
  ]
})
export class CardComponent {
  hover = false;
}
