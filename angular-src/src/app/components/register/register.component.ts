import { Component, OnInit } from '@angular/core';
import { ValidateService } from '../../services/validate.service';
import { AuthService } from '../../services/auth.service';
import { FlashMessagesService } from 'angular2-flash-messages';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  name: String;
  username: String;
  email: String;
  password: String;

  constructor(
    private validateService: ValidateService,
    private authService: AuthService,
    private flashMessages: FlashMessagesService,
    private router: Router) { }

  ngOnInit() {
  }

  onRegisterSubmit() {
    const user = {
      name: this.name,
      username: this.username,
      email: this.email,
      password: this.password
    };
    if (!this.validateService.validateRegister(user)) {
      this.flashMessages.show("Please fill in all fields", { cssClass: "alert-danger", timeOut: 3000 });
      return false;
    }
    if (!this.validateService.validateEmail(user.email)) {
      this.flashMessages.show("Please use a valid email address", { cssClass: "alert-danger", timeOut: 3000 });
      return false;
    }

    // register user
    this.authService.registerUser(user).subscribe(data => {
      if (data.success) {
        this.flashMessages.show("You're now registered and can login", { cssClass: "alert-success", timeOut: 3000 });
        this.router.navigate(["/login"]);
      } else {
        this.flashMessages.show(data.msg, { cssClass: "alert-danger", timeOut: 3000 });
        this.router.navigate(["/register"]);
      }
    });
  }
}
