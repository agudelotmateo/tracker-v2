import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.css']
})
export class ViewComponent implements OnInit {
  location: Object;
  defaultLatitude:Number = 6.199548;
  defaultLongitude: Number = -75.57934;

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit() {
    this.authService.getLocation().subscribe(location => {
      this.location = location.location;
    },
      err => {
        console.log(err);
        return false;
      });
  }
}
