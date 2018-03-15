import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service'
import { ValidateService } from '../../services/validate.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-save',
  templateUrl: './save.component.html',
  styleUrls: ['./save.component.css']
})
export class SaveComponent implements OnInit {
  user: Object;
  latitude: number;
  longitude: number;
  delay: number = 1000;
  message: string = "Loading...";
  canRecord: boolean = false;
  recording: boolean = false;

  constructor(
    private authService: AuthService,
    private validateService: ValidateService,
    private router: Router) { }

  ngOnInit() {
    this.getLocation();
    clearInterval(this.authService.timer); 
    this.authService.timer = setInterval(() => {
      let location = {
        latitude: this.latitude,
        longitude: this.longitude,
        username: localStorage.getItem("username")
      }
      if (this.validateService.validateLocation(location))
        this.authService.recordLocation(location).subscribe();
    }, this.delay);
    this.recording = true;
  }

  getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(position => {
        this.latitude = position.coords.latitude;
        this.longitude = position.coords.longitude;
      }, error => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            this.message = "User denied the request for Geolocation"
            break;
          case error.POSITION_UNAVAILABLE:
            this.message = "Location information is unavailable"
            break;
          case error.TIMEOUT:
            this.message = "The request to get user location timed out"
            break;
          default:
            this.message = "An unknown error occurred"
            break;
        }
      });
      this.message = "Recording position...";
      this.canRecord = true;
    } else {
      this.message = "Geolocation is not supported by this browser";
      this.canRecord = false;
    }
  }

  stopRecording() {
    clearInterval(this.authService.timer);    
    this.recording = false;
    this.message = "No longer recording";
  }

}
