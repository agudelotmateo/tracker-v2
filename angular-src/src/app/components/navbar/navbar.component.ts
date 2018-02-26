import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { FlashMessagesService } from 'angular2-flash-messages';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  constructor(
    private authService: AuthService,
    private flashMessages: FlashMessagesService,
    private router: Router) { }

  ngOnInit() {
  }

  onLogoutClick() {
    this.authService.logOut();
    this.flashMessages.show("You're now logged out", { cssClass: "alert-success", timeOut: 3000 });
    this.router.navigate(["/login"]);
    return false;
  }

}
