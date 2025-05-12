# NgXstateEntityViewState
- experiements with XState and Zero Sync are in play...

## Dev Notes

- DB Migration Process tools: pgroll
- State Machine: Xstate
- Sync Engine: Zero


## App Overview
- Twitter-Like
- Tweet, Retweet, Like, Reply
- Topics with #
- Follow & Followers
- Auth

## Stack Overview
- Supabase Db (with auth to be implemented)
  - Postgres (for now as proof of concept)
- Zero-Cache
- Test Vite Auth Server
- Angular Front End


## Features of Note
Refer to Hello-Zero project
- DB Function Generates '#Topics' from Message Text
- FSM used on Modal Form for loading/managing EntityView State
- Bootstrap Style system with Dark/Light mode detection

## Add these features
### Integrate Reweet, Reply and Like functions (with updated DB structure)
### User's Pages
### Auth
### Querying
- Filter Messages by Topic
- Filter Topics by Trending
- Filter Users by Popular Content
- Schema to be located in logically shared (cache + ng-client)

### TODO
- Implement EntityView State onto a 'View/Form Component' with API examples
- Implement Data layer with a Sync solution such as Zero/Electric/PowerSync
- Integrate States with a Form State (Schema & Field Settings)
    - Schema is the DB Schema (fields, types, nullables, keys, etc)
    - Field Settings is the custom configuration layer on the schema (Visibility, Validation, Disabled, Readonly, and other Meta data)

- Build Prototype with Two different List views and entity views
    - test how re-useable the Machine is, and how we would handle specific Entity Commands needs
        - if this is simply spawing an child actor or just a new actor or just use gneric api calls for the specific use cases, while the generic use cases are completely re-useable. 
