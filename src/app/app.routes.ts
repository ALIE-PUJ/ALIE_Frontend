import { Routes } from '@angular/router';
import { HomepageComponent } from './contents/homepage/homepage.component';
import { LoginComponent } from './contents/login/login.component';
import { PageNotFoundComponent } from './contents/page-not-found/page-not-found.component';

export const routes: Routes = [
    { path: '', redirectTo: '/homepage', pathMatch: 'full' },
    { path: 'homepage', component: HomepageComponent },
    // Ruta comodín para manejar rutas no existentes
    { path: 'PageNotFound', component: PageNotFoundComponent },
    { path: '**', redirectTo: '/PageNotFound' },
    { path: 'login', component: LoginComponent },
];
