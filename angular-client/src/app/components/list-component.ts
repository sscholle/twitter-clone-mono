import { Component, ContentChild, Input, TemplateRef, ViewChild } from '@angular/core';
import { trigger, transition, query, style, stagger, animate } from '@angular/animations';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-list',
  imports: [CommonModule],
  template: `
        <!-- [@listAnimation]="items.length"  -->
    <ng-container
        *ngIf="items.length; else noPosts" 
    >
        <ng-container *ngFor="let item of items; trackByFn">
            <ng-container [ngTemplateOutlet]="itemTemplateContent" [ngTemplateOutletContext]="{ $implicit: item}"></ng-container>
        </ng-container>
    </ng-container>
    <ng-template #noPosts>
        <div class="d-flex justify-content-center">
            <h3>
                <em>No posts found 😢</em>
            </h3>
        </div>
    </ng-template>
  `,
  animations: [
    trigger('listAnimation', [
        transition(':enter', [
            query('li', [
            style({ opacity: 0, transform: 'translateY(-10px)' }),
            stagger('32ms', [
                animate('60ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
            ])
            ], { optional: true })
        ]),
        transition(':leave', [
            query('li', [
            stagger('32ms', [
                animate('60ms ease-out', style({ opacity: 0, transform: 'translateY(-10px)' }))
            ])
            ], { optional: true })
        ]),
        // transition(':increment', [
        //     query('li', [
        //         stagger('32ms', [
        //             animate('60ms ease-out', style({ opacity: 0, transform: 'translateY(-20px)' }))
        //         ])
        //     ], { optional: true })
        // ]),
        // transition(':decrement', [
        //     query('li', [
        //         stagger('32ms', [
        //             animate('60ms ease-out', style({ opacity: 0, transform: 'translateY(-20px)' }))
        //         ])
        //     ], { optional: true })
        // ]),
    ])
  ]
})
export class ListComponent {
@ContentChild('itemTemplate', { static: true }) itemTemplateContent!: TemplateRef<any>;
  @Input() items: any[] = [];

}