import { Component } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../Services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-nav-menu',
  templateUrl: './nav-menu.component.html',
  styleUrl: './nav-menu.component.scss'
})
export class NavMenuComponent {
private destroySubject = new Subject()
isLoggedIn: boolean = false

constructor(private authService: AuthService, private router: Router){
  authService.authStatus.pipe(takeUntil(this.destroySubject)).subscribe(
    result => {
      this.isLoggedIn = result
    }
  )
}
onLogout(): void {
  this.authService.logout();
  this.router.navigate(["/"]);
}

ngOnInit(): void {
  this.isLoggedIn = this.authService.isAuthenticated();
}

ngOnDestroy() {
  this.destroySubject.next(true);
  this.destroySubject.complete();
}
}


