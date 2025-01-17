import { Component, OnInit } from '@angular/core';
import { BaseFormComponent } from '../base-form.component';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../Services/auth.service';
import { LoginResult } from './login-result';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { LoginRequest } from './login-request';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent extends BaseFormComponent implements OnInit {
    title?: string
    loginResult?: LoginResult 


  constructor(
    private avtivetdRoute: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ){
super()
  }

  ngOnInit() {
    this.form = new FormGroup({
      email: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required)
    })
  }

  onSubmit(){
    var loginRequest = <LoginRequest>{};

    loginRequest.email = this.form.controls['email'].value
    loginRequest.password = this.form.controls['password'].value

    this.authService.login(loginRequest).subscribe({
      next: (result) => {
        console.log(result);
        this.loginResult = result
        if(result.success){
          this.router.navigate(['/'])
        }
      },
      error: (err) => {
          console.log(err)
          if(err.status == 401){
              this.loginResult = err.error
          }
      }
    })

  }
}
