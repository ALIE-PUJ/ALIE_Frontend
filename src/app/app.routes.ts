import { NgModule } from '@angular/core';
import { Routes } from '@angular/router';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { LoginComponent } from './pages/login/login.component';
import { PageNotFoundComponent } from './pages/page-not-found/page-not-found.component';
import { AgentChatComponent } from './pages/chat/agent-chat/agent-chat.component';
import { SupervisionComponent } from './pages/chat/supervision/supervision.component';
import { FileManagementComponent } from './pages/file-management/file-management.component';

export const routes: Routes = [
    { path: '', redirectTo: '/homepage', pathMatch: 'full' }, // Pagina por defecto
    { path: 'homepage', component: HomePageComponent }, // Pagina por defecto
    { path: 'login', component: LoginComponent }, // Login (Tanto para administradores como para estudiantes)
    { path: 'chat', component: AgentChatComponent }, // Login (Tanto para administradores como para estudiantes)
    { path: 'supervision', component: SupervisionComponent }, // Login (Tanto para administradores como para estudiantes)
    { path: 'fileManagement', component: FileManagementComponent }, // Login (Tanto para administradores como para estudiantes)
    // Demas rutas


    // Siempre debe ir al final, para evitar errores en la redireccion de rutas si existentes
    { path: 'PageNotFound', component: PageNotFoundComponent }, // Ruta comodín para manejar rutas no existentes
    { path: '**', redirectTo: '/PageNotFound' }, // Pagina no encontrada (Rutas no existentes)
];

