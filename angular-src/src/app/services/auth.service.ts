import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { tokenNotExpired } from 'angular2-jwt';
import 'rxjs/add/operator/map';

@Injectable()
export class AuthService {
  authToken: any;
  user: any;
  timer: any;
  apiKey: string = "qKV4qBykvFmdVVpUcQ1w";

  constructor(private http: Http) { }

  recordLocation(location) {
    let headers = new Headers();
    headers.append("Content-Type", "application/json");
    let url = "users/record/" + this.apiKey;
    return this.http.post(url, location, { headers: headers }).map(function (res) {
      return res.json();
    });
  }

  registerUser(user) {
    let headers = new Headers();
    headers.append("Content-Type", "application/json");
    let url = "users/register/" + this.apiKey;
    return this.http.post(url, user, { headers: headers }).map(function (res) {
      return res.json();
    });
  }

  authenticateUser(user) {
    let headers = new Headers();
    headers.append("Content-Type", "application/json");
    let url = "users/authenticate/" + this.apiKey;
    return this.http.post(url, user, { headers: headers }).map(function (res) {
      return res.json();
    });
  }

  getProfile() {
    let headers = new Headers();
    this.loadToken();
    headers.append("Authorization", this.authToken);
    headers.append("Content-Type", "application/json");
    let url = "users/profile/" + this.apiKey;
    return this.http.get(url, { headers: headers }).map(function (res) {
      return res.json();
    });
  }

  getLocation() {
    let headers = new Headers();
    this.loadToken();
    headers.append("Authorization", this.authToken);
    headers.append("Content-Type", "application/json");
    let url = "users/location/" + this.apiKey;
    url += "/" + localStorage.getItem("userID");
    return this.http.get(url, { headers: headers }).map(function (res) {
      return res.json();
    });
  }

  storeUserData(user, token) {
    // local storage can only store strings
    localStorage.setItem("user", JSON.stringify(user));
    // angular2-jwt looks for this name
    localStorage.setItem("token", token);
    localStorage.setItem("userID", user.id);
    this.user = user;
    this.authToken = token;
  }

  loadToken() {
    this.authToken = localStorage.getItem("token");
  }

  loggedIn() {
    return tokenNotExpired();
  }

  logOut() {
    this.authToken = null;
    this.user = null;
    localStorage.clear();
    clearInterval(this.timer);
  }
}
