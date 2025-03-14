import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { TodoListComponent } from './components/todo-list/todo-list.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [ { path: '', component: TodoListComponent, canActivate: [AuthGuard] },
{ path: 'login', component: LoginComponent },
{ path: '**', redirectTo: '' },];
