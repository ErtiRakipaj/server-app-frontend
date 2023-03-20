import { AuthGuard } from './service/auth.guard';
import { RegisterComponent } from './register/register/register.component';
import { ServerComponent } from './serverComponent/server/server.component';
import { AppComponent } from './app.component';
import { LoginComponent } from './auth/login/login.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {path: 'login', component: LoginComponent},
  {path: 'register', component: RegisterComponent},
  {path: 'servers', component: ServerComponent, canActivate: [AuthGuard]},
  {path: '', redirectTo:'login',pathMatch:'full'},
  {path: '**', redirectTo:'login',pathMatch:'full'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
