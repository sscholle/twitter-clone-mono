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
        "path": "messages",
        "loadComponent": () => import('./messages/messages.component').then(m => m.MessagesComponent)
    },
    {
        "path": "bookmarks",
        "loadComponent": () => import('./bookmarks/bookmarks.component').then(m => m.BookmarksComponent)
    },
    // {
    //     "path": "about",
    //     "loadComponent": () => import('./about/about.component').then(m => m.AboutComponent)
    // },
    {
        "path": "**",
        "redirectTo": "home"
    }

];
