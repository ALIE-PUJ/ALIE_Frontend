import { Routes } from '@angular/router';
import { HomePageComponent } from './contents/home-page/home-page.component';
import { LoginComponent } from './contents/login/login.component';
import { PageNotFoundComponent } from './contents/page-not-found/page-not-found.component';

export const routes: Routes = [
    { path: '', redirectTo: '/homepage', pathMatch: 'full' }, // Pagina por defecto
    { path: 'homepage', component: HomePageComponent }, // Pagina por defecto
    { path: 'PageNotFound', component: PageNotFoundComponent }, // Ruta comodín para manejar rutas no existentes
    { path: '**', redirectTo: '/PageNotFound' }, // Pagina no encontrada (Rutas no existentes)
    { path: 'login', component: LoginComponent }, // Login (Tanto para administradores como para estudiantes)
];
