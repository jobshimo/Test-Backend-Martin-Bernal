import { Component, OnDestroy, OnInit } from '@angular/core';
import { Papa, ParseResult } from 'ngx-papaparse';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  constructor(private papa: Papa, private http: HttpClient) {}

  csv1Subs: Subscription;
  csv1: ParseResult;
  json1Subs: Subscription;
  json1: ParseResult;
  csv2Subs: Subscription;
  csv2: ParseResult;
  json2Subs: Subscription;
  json2: ParseResult;

  ngOnInit(): void {
    this.csv1Subs = this.http
      .get('../assets/csvFile/example1/example1.csv', { responseType: 'text' })
      .subscribe((data) => {
        this.papa.parse(data, {
          complete: (result) => {
            this.csv1 = result;
            console.log(this.csv1);
          },
        });
      });
    this.json1Subs = this.http
      .get('../assets/csvFile/example1/example1.json', { responseType: 'text' })
      .subscribe((data) => {
        this.json1 = JSON.parse(data);
        console.log(this.json1['categories']['bargain']);
      });

    this.csv2Subs = this.http
      .get('../assets/csvFile/example2/example2.csv', { responseType: 'text' })
      .subscribe((data) => {
        this.papa.parse(data, {
          complete: (result) => {
            this.csv2 = result;
            console.log(this.csv2);
          },
        });
      });
    this.json2Subs = this.http
      .get('../assets/csvFile/example2/example2.json', { responseType: 'text' })
      .subscribe((data) => {
        this.json2 = JSON.parse(data);
        console.log(this.json2);
      });
  }

  ngOnDestroy(): void {
    if (this.csv1Subs) {
      this.csv1Subs.unsubscribe();
    }
    if (this.json1Subs) {
      this.json1Subs.unsubscribe();
    }
    if (this.csv2Subs) {
      this.csv2Subs.unsubscribe();
    }
    if (this.json2Subs) {
      this.json2Subs.unsubscribe();
    }
  }
}
