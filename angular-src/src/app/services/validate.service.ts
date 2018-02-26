import { Injectable } from '@angular/core';

@Injectable()
export class ValidateService {

  constructor() { }

  validateRegister(user) {
    if (user.name === undefined || user.username === undefined
      || user.email === undefined || user.password === undefined)
      return false;
    if (user.name.trim().length === 0 || user.username.trim().length === 0
      || user.email.trim().length === 0 || user.password.trim().length === 0)
      return false;
    return true;
  }

  // https://stackoverflow.com/questions/46155/how-can-you-validate-an-email-address-in-javascript
  validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }

  validateLocation(location) {
    if (location.latitude === undefined || location.longitude === undefined ||
      location.username === undefined)
      return false;

    if (location.latitude === null ||
      location.longitude === null ||
      location.username === null)
      return false;

    return true;
  }
}
