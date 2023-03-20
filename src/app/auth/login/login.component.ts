import { NgForm } from '@angular/forms';
import { UserauthService } from './../../service/userauth.service';
import { AuthService } from './../../service/auth.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationService } from 'src/app/service/notification.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {


  constructor(private router: Router, private authService: AuthService, private userAuthService: UserauthService, private notifier: NotificationService) {}

  ngOnInit(): void {
  }

  login(loginForm: NgForm) {
    this.authService.login(loginForm.value) .subscribe(
      (response:any) => {
        this.userAuthService.setToken(response.token);

        this.router.navigate(['/servers']);

      },
      (error) => {
        this.notifier.onError("Incorrect username or password. Please try again");
      }
    );
  }

}
