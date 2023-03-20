import { CustomResponse } from 'src/app/interface/custom-response';
import { NgForm } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/service/auth.service';
import { UserauthService } from 'src/app/service/userauth.service';
import { NotificationService } from 'src/app/service/notification.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  passwordError: boolean = false;
  emailError: boolean = false;

  constructor(private router: Router, private authService: AuthService, private userAuthService: UserauthService, private notifier: NotificationService) {}

  ngOnInit(): void {
  }

  register(registerForm:NgForm) {
    if(!this.validatePassword(registerForm.value.password) || !this.validateEmail(registerForm.value.email)) {
      return;
    }
    this.authService.register(registerForm.value).subscribe(
      (response:any) =>{

        response.confirmation === 'Username already exists' ? this.notifier.onError(response.confirmation) : this.notifier.onSuccess(response.confirmation);

        registerForm.resetForm();

      },
      (error) => {
        this.notifier.onError(error);
      }
    )
  }

        validatePassword(password:string):boolean {
          const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

          const passwordInput = document.getElementById('password') as HTMLInputElement;

        if (!passwordRegex.test(password)) {
        passwordInput.classList.add('invalid-input');
        this.notifier.onError("Password must be at least 8 characters long and must contain at least 1 number")
        this.passwordError = true;
        return false;
        } else {
        passwordInput.classList.remove('invalid-input');
        this.passwordError = false;
        return true;
        }
    }

    validateEmail(email:string):boolean {
      const emailRegex  = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      const emailInput = document.getElementById('email') as HTMLInputElement;
      if (!emailRegex.test(email)) {
        emailInput.classList.add('invalid-input');
        this.notifier.onError("Please put a valid email")
        this.emailError = true;
        return false;
        } else {
        emailInput.classList.remove('invalid-input');
        this.emailError = false;
        return true;
        }
    }
}
