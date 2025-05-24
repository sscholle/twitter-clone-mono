import { Component, inject, Input, OnDestroy, OnInit, Type } from '@angular/core';
import { EntityViewContext, EntityViewMachine } from './machine';
import {
  Actor,
  AnyMachineSnapshot,
  AnyStateMachine,
  __unsafe_getAllOwnEventDescriptors,
  createActor,
  fromPromise,
} from 'xstate';
import { createBrowserInspector } from '@statelyai/inspect';
import { CommonModule } from '@angular/common';
import { NgbActiveModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { QueryService, ZeroService } from 'zero-angular';
import { Medium, Message, Schema, schema, User } from '../util/schema';
import { FormsModule } from '@angular/forms';
import { randID } from '../util/rand';
import { allRepositories as repo } from '../shared/allRepos';

const { inspect } = createBrowserInspector({
  // Comment out the line below to start the inspector
  autoStart: false
});

@Component({
  selector: 'app-my-entity-view',
  imports: [CommonModule, NgbModalModule, FormsModule],
  templateUrl: './my-entity-view.component.html',
  styleUrl: './my-entity-view.component.scss'
})
export class MyEntityViewComponent implements OnInit, OnDestroy {
	activeModal = inject(NgbActiveModal);
  queryService = inject(QueryService);
  zeroService = inject(ZeroService<Schema>);
  JSON = JSON;
  machine: Actor<AnyStateMachine> | undefined;
  snapshot: AnyMachineSnapshot = {} as AnyMachineSnapshot;
  stateValueString: string = '';
  nextEvents: any[]= [];
  @Input() inputValues: EntityViewContext = {
    entityId: '',
    type: '',
    data: null,// should try with some data
    errors: [],
    // NOTE: a somewhat opinionated permission system - imassuming we'd use auth tokens to check permissions?
    permissions: ['view', 'edit', 'create', 'delete'],
  };

  messageShape(
    mediumID: string,
    senderID: string,
    body: string,
    id?: string,
    timestamp?: number,
  ): Message {
    return {
      id: id || randID(),
      senderID,
      mediumID,
      body,
      timestamp: timestamp || new Date().getTime(),
    };
  }

  ngOnInit(): void {
    // const restoredState = JSON.parse(localStorage.getItem('snapshot') || '{}');
    // Load Vaues from Route Params
    this.machine = createActor(
      EntityViewMachine.provide({
        actions: {
          notifyEntityClosed: () => {
            console.log('Entity closed');
            this.activeModal.close();
          },
          notifyEntityCreated: () => {
            console.log('Entity created');
          },
          notifyEntityOpened: () => {
            console.log('Entity opened');
          },
          notifyEntityUpdated: () => {
            console.log('Entity updated');
            this.activeModal.close();
          },
          notifyEntityDeleted: () => {
            console.log('Entity deleted');
            this.activeModal.close();
          },
        },
        actors: {
          tryCreateEntity: fromPromise(({ input }: { input: EntityViewContext }) => {
            const message = this.messageShape(
              this.selectedMedium,
              this.zeroService.getZero().userID,// TODO: get user id from auth
              this.message,
            )
            return new Promise((resolve) => {
              repo.message?.create(message)
              .then(() => {
                console.log('Created message:', message);
                resolve(true);
              })
              .catch((error) => {
                console.error('Error creating message:', error);
                resolve(false);
              });
            })
          }),
          loadEntity: fromPromise(({ input }: { input: EntityViewContext }) => {
            return new Promise((resolve) => {
              console.log('Loading message:', input.entityId);
              repo.message?.findOne(input.entityId as string)
              .then((data) => {
                console.log('Loaded message:', data);
                resolve(data);
              })
              .catch((error) => {
                console.error('Error loading message:', error);
                resolve(null);
              });
            });
          }),
          tryUpdateEntity: fromPromise(({ input }: { input: EntityViewContext }) => {
            const message: Partial<Message> = {
              mediumID: this.selectedMedium,
              body: this.message,
              senderID: this.zeroService.getZero().userID,
              id: input.entityId as string,
            };
            console.log('Updating message:', input.entityId, message);
            return new Promise((resolve) => {
              repo.message?.update(message)
              .then(() => {
                console.log('Updated message:', input.data);
                resolve(true);
              })
              .catch((error) => {
                console.error('Error updating message:', error);
                resolve(false);
              });
            });
          }),
          tryDeleteEntity: fromPromise(({ input }: { input: EntityViewContext }) => {
            const message: Partial<Message> = {
              mediumID: this.selectedMedium,
              body: this.message,
              senderID: this.zeroService.getZero().userID,
              id: input.entityId as string,
            };
            return new Promise((resolve) => {
              repo.message?.delete(message as Message)
              .then(() => {
                console.log('Deleted message:', input.entityId);
                resolve(true);
              })
              .catch((error) => {
                console.error('Error deleting message:', error);
                resolve(false);
              });
            });
          })
        }
      }),
      {
        input: this.inputValues,
      }
    );
    this.machine.subscribe((snapshot: AnyMachineSnapshot) => {
      this.snapshot = snapshot;
      this.debugState(snapshot);

      // TODO: Look at a Clean way to apply the state to the UI
      if(Object.keys(snapshot.value).includes("Open")) {
        console.log('Machine Open:', snapshot.value);
        this.message = snapshot.context.data?.body || '';
        this.selectedMedium = snapshot.context.data?.mediumID || '';
      }
    });
    this.machine.start();
    this.loadQueryData();
  }

  mediums: Medium[] = [];
  selectedMedium: string = "";
  message: string = "";
  loadQueryData() {
    repo.medium?.find().then((mediums) => {
      console.log('Mediums:', mediums);
      this.mediums = mediums;
      this.selectedMedium = mediums[0].id;
    });
  }

  send(event: any) {
    if (this.machine) {
      this.machine.send(event);
    }
  }

  getNextTransitions(state: AnyMachineSnapshot) {
    return state._nodes.flatMap((node) => [...node.transitions.values()]).flat(1);
  }

  ngOnDestroy(): void {
    if (this.machine) {
      localStorage.setItem('snapshot', JSON.stringify(this.machine.getPersistedSnapshot()));
      this.machine.stop();
    }
  }

  updateData(key: string, value: any) {
    if (this.machine) {
      this.machine.send({ type: 'UpdateEntityData', data: {[key]: value} } );
    }
  }

  debugState(snapshot: AnyMachineSnapshot) {
    // DEBUGGING
    this.nextEvents = __unsafe_getAllOwnEventDescriptors(this.snapshot)
      .filter((event) => !event.startsWith('xstate.'));
    this.stateValueString = snapshot._nodes
      .filter((s) => s.type === 'atomic' || s.type === 'final')
      .map((s) => s.id)
      .join(', ')
      .split('.')
      .slice(1)
      .join('.');
    console.group('State update');
    console.log('%cState value:', 'background-color: #056dff', snapshot.value);
    console.log('%cState:', 'background-color: #056dff', snapshot);
    console.groupCollapsed('%cNext events:', 'background-color: #056dff');
    console.log(
      this.getNextTransitions(snapshot)
        .map((t: { eventType: any; }) => {
          return `feedbackActor.send({ type: '${t.eventType}' })`;
        })
        .join('\n\n')
    );
    console.groupEnd();
    console.groupEnd();
  }
}
