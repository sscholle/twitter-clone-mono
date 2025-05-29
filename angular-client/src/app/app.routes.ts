import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        "path": "",
        "pathMatch": "full",
        "redirectTo": "home"
    },
    {
        "path": "home",
        "loadComponent": () => import('./home/home.component').then(m => m.HomeComponent)
    },
    {
        "path": "explore",
        "loadComponent": () => import('./messages/messages.component').then(m => m.MessagesComponent)
    },
    // {
    //     "path": "topic/:topic",
    //     "loadComponent": () => import('./topic/topic.component').then(m => m.TopicComponent)
    // },
    {
        "path": "bookmarks",
        "loadComponent": () => import('./bookmarks/bookmarks.component').then(m => m.BookmarksComponent)
    },
    {
        "path": "profile",
        "loadComponent": () => import('./profile/profile.component').then(m => m.ProfileComponent)
    },
    {
        "path": "**",
        "redirectTo": "home"
    }

];
