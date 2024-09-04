import { Routes } from '@angular/router';
import { HomepageComponent } from './contents/homepage/homepage.component';
import { LoginComponent } from './contents/login/login.component';
import { NotfoundComponent } from './contents/notfound/notfound.component';

export const routes: Routes = [
    { path: '', redirectTo: '/homepage', pathMatch: 'full' },
    { path: 'homepage', component: HomepageComponent },
    // Ruta comodín para manejar rutas no existentes
    { path: 'PageNotFound', component: NotfoundComponent },
    { path: '**', redirectTo: '/PageNotFound' },
    { path: 'login', component: LoginComponent },
];
