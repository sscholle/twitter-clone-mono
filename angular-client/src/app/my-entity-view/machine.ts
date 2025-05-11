import { and, assign, fromPromise, setup } from 'xstate';

export interface EntityViewParams {
  entityId: string | null;
  type: string | null;
}
export interface EntityErrorEvent extends EntityViewParams {
  error: unknown;
}
export type EntityViewPermission = 'view' | 'edit' | 'create' | 'delete';
export interface EntityViewContext extends EntityViewParams {
  data: any | null;
  errors: string[];
  permissions: EntityViewPermission[];
}

type EntityViewEvent =
  | { type: 'RetryLoad' }
  | { type: 'DraftEntity' }
  | { type: 'CreateEntity' }
  | { type: 'EditEntity' }
  | { type: 'UpdateEntity' }
  | { type: 'FinishEditing' }
  | { type: 'DeleteEntity' }
  | { type: 'CloseEntity' }
  // FOR DEBUGGING
  | {
      type: 'UpdateEntityData';
      data: object;
    };

export const EntityViewMachine = setup({
  types: {
    context: {} as EntityViewContext,
    events: {} as EntityViewEvent,
    input: {} as EntityViewContext,
  },
  actors: {
    // all of these are placeholders for the actual service calls
    loadEntity: fromPromise(({ input }: { input: EntityViewContext }) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ ...input.data });
        }, 2000);
      })
    }),
    tryCreateEntity: fromPromise(({ input }: { input: EntityViewContext }) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ ...input.data});
        }, 2000);
      })
    }),
    tryUpdateEntity: fromPromise(({ input }: { input: EntityViewContext }) =>
      new Promise((resolve) => {
        setTimeout(() => {
          resolve({ ...input.data });
        }, 2000);
      })
    ),
    tryDeleteEntity: fromPromise(({ input }: { input: EntityViewContext }) =>
      new Promise((resolve) => {
        setTimeout(() => {
          resolve({ ...input.data });
        }, 2000);
      })
    ),
  },
  actions: {
    // PUBLISHING for External Events (ie UI Toasts or Broadcast on Websockets, etc.)
    notifyEntityCreated: (_, params: EntityViewParams) => {
      console.log('notifyEntityCreated', params);
    },
    notifyEntityOpened: (_, params: EntityViewParams) => {
      console.log('notifyEntityOpened', params);
    },
    notifyEntityUpdated: (_, params: EntityViewParams) => {
      console.log('notifyEntityUpdated', params);
    },
    notifyEntityDeleted: (_, params: EntityViewParams) => {
      console.log('notifyEntityDeleted', params);
    },
    notifyEntityClosed: (_, params: EntityViewParams) => {
      console.log('notifyEntityClosed', params);
    },

    // PUBLISHING for External Errors (ie UI Toasts or Broadcast on Websockets, etc.)
    notifyEntityLoadError: (_, params: EntityErrorEvent) => {
      console.log('notifyEntityLoadError', params);
    },
    notifyEntityCreatedError: (_, params: EntityErrorEvent) => {
      console.log('notifyEntityCreateError', params);
    },
    notifyEntityUpdatedError: (_, params: EntityErrorEvent) => {
      console.log('notifyEntityUpdateError', params);
    },
    notifyEntityDeletedError: (_, params: EntityErrorEvent) => {
      console.log('notifyEntityDeleteError', params);
    },

    // SUBSCRIPTIONS from External Events (ie from Websockets, etc.)
    subscribeEntityUpdated: (_, params: EntityViewParams) => {
      console.log('subscribeEntityOpened', params);
    },
    unsubscribeEntityUpdated: (_, params: EntityViewParams) => {
      console.log('unsubscribeEntityOpened', params);
    },

    subscribeEntityDeleted: (_, params: EntityViewParams) => {
      console.log('subscribeEntityDeleted', params);
    },
    unsubscribeEntityDeleted: (_, params: EntityViewParams) => {
      console.log('unsubscribeEntityDeleted', params);
    },
  },
  guards: {
    isViewOnly: ({ context }) => context.permissions.some((p) => p === 'view') && !context.permissions.some((p) => p === 'edit'),
    isEditOnly: ({ context }) => context.permissions.some((p) => p === 'edit') && !context.permissions.some((p) => p === 'view'),
    canView: ({ context }) => context.permissions.some((p) => p === 'view'),
    canCreate: ({ context }) => context.permissions.some((p) => p === 'create'),
    canUpdate: ({ context }) => context.permissions.some((p) => p === 'edit'),
    canEdit: ({ context }) => context.permissions.some((p) => p === 'edit'),
    canDelete: ({ context }) => context.permissions.some((p) => p === 'delete'),
    isEntityIdProvided: ({ context }) => !!context.entityId,
    isdataProvided: ({ context }) => !!context.data,
    iserrorsProvided: ({ context }) => !!context.errors.length,
  },
}).createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QFEB2AXAlugngAgDVMwB3PAZXQEN0w8BaPAMQHsAnPAYRYzZYBt+mVFDwBVAJJ4SACzCo8EjGDZUAxlhHTsMvFQVosuAHRLsmKvwDEAbQAMAXUSgADi1jmezkAA9EARgB2O2MATnDwgDYADgBmABY7AFZI2IAaEBxEeIAmeOM7QOj-JLtYvITYwMCAXxqMw2x8IlIKaloGZnYuHnQ+QWFRSWk5BSVaVQ1B7XRdfTxGkzMsS1t-JyQQNw8sL02-BCCQiKi4xJT0zIC7SONA+PDo6KTY0PinvLqGjCbCYjJKDQ6IxWBxuLwBEItMNZPJFMpJppRCQdHoDD8lqhzKsbDkNq53J5UN4Dv5IscTjEEslUhksgh4sECkV-IlQnZGTkqvEviBFs1-m0gZ1QT0IQNoVJYWMEeokTM5uijDhjAAZFhUCCDKwQHhgYzCABuLAA1vr+X9WoCOiDuuC+pDpjDRvCJnLpijZmiFhiVerNYMEEaWGoaJgePYHJHvNsiSTEC8kmEbjlIlTonZooEcnTEDkkvkcsV-HFQtF4v5CqleRaWgD2sCumDev0oUMpS7xip3VpPYqfcq1RqtSIrCo+GxjC5+DQAGbsAC2xlrgutjdF9tbTo7cK7iI9qPm-KHAZEQdQxtDu1Qkejm1j1-jCALSfZkVT6cz2dzhwSxizDyRCkwSRME8SxDWvqWvWwq2s24ptuIO4ym6Uy9oeSpNCeEBMFQmD8JAVgAEpgH0OD+hAd4Ejs4bEvsCbxK+KZpnEGZZjmVwIOWxjcuErzFKEsSVpEkHKtBQo2k2YoOhK7YjLuspociGEDlhAAiqizugVicGwYBAvyVFbISj70QgRY5AUQn5qk5TlEk0Q-gWlmFMUmb+P4b5JLU9R8lBdYSeudoto6krySh3ZKQq3rHrp+lIjqeoGheprmv5q4NiKwUIdu4WupF8p9jFvrGHFYZnsGV60bejgxiZtFPjk2ZWf4NmxHZ+aOZxgQeWE5bxO8lZCayPnfGJAVrll8EyYhzoKahhUqbFenlVAY5sBOU4zug85sEuK5WplcHSVuYXSvl+7oV6R4lWVSLnpeYYRo4RkPg1ZkWS1bUdQ5TmhJZ3nFAWgRlvc-gQb5B0wZJG4hbJSF5XuPbKddmEmAA8i48hWGpYAEbQhm1fe9V7KABzvj+HneTx4FxJ50RASDSSib8E1HVJm6hXJ51I1FRU3YOmPY5w-DuGAhP4sZNGk74CYcfSrWFP+tNlKBLwlqNfnjRlsEc3Ds3IRdyPRQLWFC6gxi47OVAAK78NpyBaugEt1dLdFk4goTg8Y7wDR5dhBM8gRJD+QEhB58TvhUFaVv4LO4OJk3HZz8NzRFl0o-2x7m8uTvamILgQAZvpqTQVCvST7uy4cNxJkWrXFAk9w5HYoROQHxhkqyoTkgzuTsszkPpYduuwzlZ2dopi2o6pGNYxbjvmKOTDCJgsAyIvSIV27T5e7EPv9f7gfeSHnFJOExiRKyYf3C8wSa1DgVTSdXMIzzU8HjP2fz7nS9rQXRcCa+m3nGMyrIKzGHruUaIRZ2Rli6vSIClkr6MXLIJPuOR44ChHjDbKM1crvwWp-LOJUc4ANWolVA+pgxmmXMPaGQVpqnW5pPIhV0SGCx-uQ+6lUno3hekTaioCPaHD9pAxuFlohwKeD+BIr4HIJDeAkPIXIeRD21jgxhL9U6G15tPDh6k8akW1LqKhyVjS0MfknPW48WHzQKsQ4qg5cb40DLw68NVJZvRlgcJIJRjApHzHYVMRxkiU2SPvZ4uRgh+OCVUB+9Cn7J31gQ1hDj2FOMMa40c452BbTnIuOhGiGHPxTgbRGH8MmmxMC44xFUUpVWelGQRUthHV2-JxIagQwhVBeAzGBLcRK8lQCwCAcBvBWPZmPfBE97EZxNmjekQjTIiPoJEH8aysGJymXg5hb80nzP5os0wWIVj8Fdm0g4uRKaskvnkUI2YSgPPPuULZbNR67NfmnI2fMlolQooMC5Kzq7tW6c8QSwdQhJHVskU+9Jig+wiMHAZ-1yhDLGqzHWuCmFfN0ZUzOmSTAUVwvhSAQL3oiPuKEA+4FAgsTiO1fwP5-phAcjkZ54Rm75jeVirRZTUlzONkc2eKoNJUC0uSnxCYyiQJ7lInqXJgaRHiE5XIASWSMRQS8KoPLNGlJSbM9OQq-mDjuoC4mO8zLXLPq8SBZRr4tzRQHXVJTkm2P2YK35X9SHz0lVXA4gQhI0qqPS9qQlKbtR9gogaTU3hBEDS6pJNiZl2KNV6gxc95CWzANbO26A-VPmqNS32IaYgMvDZxVI0QD493ZX4zy+ZMHqMxXqt1KaPVpv0YSlUOdN7muWRS6uHlBJ3GKEWOlLwHjVFDi8TurIHIPFiBgxN1jpl7O+Xoxx1Se1cMLqtAtYDlXVqgbETMAcW7QtDmSTuDzBKt1iFffiK6dk4p0RUthBLt3ZuyVAA9Ij2X+B6cHcGQNggD3CUBHihR2VpkiP9ICEMMUJ3edi7R5TCHpM-cckWYsIB-qHWWAJ1kGaZlTH49ZnSW7dPvUWyFzxB5Iewa65N668UfoWSK79pEyUWsuYgHq3SggawLA26oTLOlfgCd5RI9xgnn0zHUOoQA */
  context: ({input}) => ({
    entityId: input.entityId || null,
    type: input.type || null,
    data: input.data || null,
    errors: input.errors || [],
    permissions: input.permissions || [],
  }),
  id: 'Entity View State - For Controlling UI when Interacting with an Entity',
  initial: 'Initial',
  states: {
    Initial: {
      always: [
        {
          target: 'Open',
          guard: and([
            'isEntityIdProvided',
            'isdataProvided',
          ]),
        },
        {
          target: 'Loading',
          guard: 'isEntityIdProvided'
        },
        {
          target: 'Draft',
          guard: 'canCreate'
        },
        {
          target: 'Closed',
        },
      ]
    },
    // Initial state of the machine
    // This state will be used to load the entity data if it is not already loaded
    Loading: {
      tags: ['loading'],
      invoke: {
        src: 'loadEntity',
        input: ({ context }) => context,
        onDone: {
          target: 'Open',
          actions: assign({
            data: ({ event }) => event.output,
          }),
        },
        onError: {
          target: 'LoadFailed',
          actions: [
            assign({
              errors: ({ event, context }) => ([...context.errors, event.error as string]),
            }),
            {
              type: 'notifyEntityLoadError',
              params: ({context, event}) => ({ type: context.type, entityId: context.entityId, error: event.error }),
            }
          ]
        }
      },
    },
    LoadFailed: {
      on: {
        RetryLoad: {
          target: 'Loading',
        }
      }
    },
    Draft: {
      tags: ['drafting'],
      on: {
        // we might want to track if the data was updated - and then use it in a guard to check if we need to update the entity
        UpdateEntityData: {
          description: 'Update the entity data in the context (we may want the ReactiveForm to send updates the machine)',
          actions: assign({
            // Merge data from the event with the context data
            // This is a bit of a hack, but it works for now
            data: ({ event, context }) => ({ ...context.data, ...event.data}),
          }),
        },
        CreateEntity: {
          target: 'Creating',
        },
      },
    },
    Creating: {
      tags: ['loading'],
      invoke: {
        src: 'tryCreateEntity',
        input: ({ context }) => context,
        onDone: {
          target: 'OpenOrClose',
          actions: [
            assign({
              data: ({ event }) => event.output,
            }),
            {
              type: 'notifyEntityCreated',
              params: ({context}) => ({ type: context.type, entityId: context.entityId }),
            },
          ]
        },
        onError: {
          target: 'Draft',
          actions: [
            assign({
              errors: ({ event, context }) => ([...context.errors, event.error as string]),
            }),
            {
              type: 'notifyEntityCreatedError',
              params: ({context, event}) => ({ type: context.type, entityId: context.entityId, error: event.error }),
            }
          ]
        },
      },
    },
    OpenOrClose: {
      always: [
        {
          target: 'Open',
          guard: and([
            'isEntityIdProvided',
            'isdataProvided',
          ]),
        },
        {
          target: 'Loading',
          guard: 'isEntityIdProvided'
        },
        {
          target: 'Closed',
        },
      ],
    },
    Open: {
      initial: 'Default',
      on: {
        DeleteEntity: {
          target: 'Deleting',
          guard : 'canDelete',
        },
        CloseEntity: 'Closed'
      },
      states: {
        Default: {
          tags: ['viewing'],
          always: [
            {
              target: 'Editing',
              guard: 'isEditOnly',
            }
          ],
          on: {
            EditEntity: {
              target: 'Editing',
              guard: 'canEdit'
            }
          },
        },
        Editing: {
          tags: ['editing'],
          on: {
            // we might want to track if the data was updated - and then use it in a guard to check if we need to update the entity
            UpdateEntityData: {
              description: 'Update the entity data in the context (we may want the ReactiveForm to send updates the machine)',
              target: 'Editing',
              actions: assign({
                // Merge data from the event with the context data
                // This is a bit of a hack, but it works for now
                data: ({ event, context }) => ({ ...context.data, ...event.data}),
              }),
            },
            FinishEditing: 'Default',
            UpdateEntity: 'Updating'
          },
        },
        Updating: {
          tags: ['loading'],
          invoke: {
            src: 'tryUpdateEntity',
            input: ({ context }) => context,
            onDone: {
              target: 'Default',
              actions: [
                {
                  type: 'notifyEntityUpdated',
                  params: ({context}) => ({ type: context.type, entityId: context.entityId }),
                },
                assign({
                  data: ({ event }) => event.output,
                }),
              ]
            },
            onError: {
              target: 'Editing',
              actions: [
                assign({
                  errors: ({ event, context }) => ([...context.errors, event.error as string]),
                }),
                {
                  type: 'notifyEntityUpdatedError',
                  params: ({context, event}) => ({ type: context.type, entityId: context.entityId, error: event.error }),
                }
              ]
            },
          },
        },
      },
      entry: [
        {
          type: 'notifyEntityOpened',
          params: ({context}) => ({ type: context.type, entityId: context.entityId }),
        },
        {
          type: 'subscribeEntityUpdated',
          params: ({context}) => ({ type: context.type, entityId: context.entityId }),
        },
        {
          type: 'subscribeEntityDeleted',
          params: ({context}) => ({ type: context.type, entityId: context.entityId }),
        }
      ],
      exit: [
        {
          type: 'unsubscribeEntityUpdated',
          params: ({context}) => ({ type: context.type, entityId: context.entityId }),
        },
        {
          type: 'unsubscribeEntityDeleted',
          params: ({context}) => ({ type: context.type, entityId: context.entityId }),
        }
      ]
    },
    Deleting: {
      tags: ['loading'],
      invoke: {
        src: 'tryDeleteEntity',
        input: ({ context }) => context,
        onDone: {
          target: 'Deleted',
          actions: [
            assign({
              data: ({ event }) => event.output,
            }),
            {
              type: 'notifyEntityDeleted',
              params: ({context}) => ({ type: context.type, entityId: context.entityId }),
            },
          ]
        },
        onError: {
          target: 'Open',
          actions: [
            assign({
              errors: ({ event, context }) => ([...context.errors, event.error as string]),
            }),
            {
              type: 'notifyEntityDeletedError',
              params: ({context, event}) => ({ type: context.type, entityId: context.entityId, error: event.error }),
            }
          ]
        }
      },
    },
    Closed: {
      entry: [
        {
          type: 'notifyEntityClosed',
          params: ({context}) => ({ type: context.type, entityId: context.entityId }),
        },
      ],
      type: 'final'
    },
    Deleted: {
      type: 'final'
    },
  },
});
