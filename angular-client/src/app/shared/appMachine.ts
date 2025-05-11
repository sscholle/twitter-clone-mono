import { assign, createMachine, setup } from 'xstate';

/**
 * ### All Entity State to keep track of:
- App State
	- defines what/where you are currently doing?
		- which entity is currently open,drafting (tracked via guids and local caches)
		- which entity list you are viewing
		- or just what page/route you are on? (ie your last action/state snapshot)
	- nothing is open, so you are in root/home?
	- what about having multiple Entities in Draft?
		- maybe you are drafting Entity 1 which is dependent on Entity 2 also drafting?
		- do we nest the drafts? (and simply update given context on save?)
			- we should define which Entities ALLOW other Entities to be 'Drafted within'
				- which would in effect not close the current entity, but just Open a 'Modal' 
	- how do we manage multiple drafts?
		- example: we want to creat a Job but we realise halfway that we need to Create a Customer or a Model that must link to this.
			- 1. allow a sub entity draft
			- 2. navigate to create new entity directly
				- by allowing 'sub-drafting' - we can have multiple drafts 'open' conceptually
					- visually we simply 'overlay the next entity subdraft' (modals/asides)
	- additional entities may be drafted and will be tracked locally (with guids)
		- drafts can be managed through several optional mechanisims
 */
export type AppContext = {
    currentEntity: string | null; // GUID of the currently open entity
    drafts: Array<{ id: string; type: 'draft' | 'subDraft' }>; // Array of draft entities with their GUIDs
    lastAction: string | null; // Snapshot of the last action/state
}
export type AppEvents = 
    | {type: 'OPEN_ENTITY'; entityId: string }
    | {type: 'CLOSE_ENTITY'}
    | {type: 'START_DRAFT'; entityId: string}
    | {type: 'SAVE_DRAFT'; entityId: string}
    | {type: 'CANCEL_DRAFT'; entityId: string}
    | {type: 'START_SUB_DRAFT'; entityId: string}
    | {type: 'SAVE_SUB_DRAFT'; entityId: string}
    | {type: 'CANCEL_SUB_DRAFT'; entityId: string}
    | {type: 'ADD_DRAFT'; entityId: string}
    | {type: 'REMOVE_DRAFT'; entityId: string}
    | {type: 'ADD_SUB_DRAFT'; entityId: string}
    | {type: 'REMOVE_SUB_DRAFT'; entityId: string}
    | {type: 'SET_LAST_ACTION'; action: string}
    | {type: 'CLEAR_LAST_ACTION'};
export const appMachine = setup(
{
    types: {
        context: {} as AppContext,
        events: {} as AppEvents
    },
  }
)
.createMachine({
  id: 'app',
  initial: 'home',
  context: {
    currentEntity: null, // GUID of the currently open entity
    drafts: [], // Array of draft entities with their GUIDs
    lastAction: null, // Snapshot of the last action/state
  },
  states: {
    home: {
      on: {
        OPEN_ENTITY: {
          target: 'entityView',
          actions: assign({
            currentEntity: ({ event }) => event.entityId,
          }),
        },
      },
    },
    entityView: {
      initial: 'viewing',
      states: {
        viewing: {
          on: {
            START_DRAFT: {
              target: 'drafting',
              actions: assign({
                drafts: ({ context, event }) => [
                  ...context.drafts,
                  { id: event.entityId, type: 'draft' },
                ],
              }),
            },
          },
        },
        drafting: {
          on: {
            SAVE_DRAFT: {
              target: 'viewing',
              actions: assign({
                drafts: ({ context, event }) =>
                  context.drafts.filter(draft => draft.id !== event.entityId),
              }),
            },
            CANCEL_DRAFT: {
              target: 'viewing',
              actions: assign({
                drafts: ({ context, event }) =>
                  context.drafts.filter(draft => draft.id !== event.entityId),
              }),
            },
            START_SUB_DRAFT: {
              target: 'subDrafting',
              actions: assign({
                drafts: ({ context, event }) => [
                  ...context.drafts,
                  { id: event.entityId, type: 'subDraft' },
                ],
              }),
            },
          },
        },
        subDrafting: {
          on: {
            SAVE_SUB_DRAFT: {
              target: 'drafting',
              actions: assign({
                drafts: ({ context, event }) =>
                  context.drafts.filter(draft => draft.id !== event.entityId),
              }),
            },
            CANCEL_SUB_DRAFT: {
              target: 'drafting',
              actions: assign({
                drafts: ({ context, event }) =>
                  context.drafts.filter(draft => draft.id !== event.entityId),
              }),
            },
          },
        },
      },
      on: {
        CLOSE_ENTITY: {
          target: 'home',
          actions: assign({
            currentEntity: () => null,
          }),
        },
      },
    },
  },
});