import { Component, OnDestroy, OnInit } from '@angular/core';
import { Papa, ParseResult } from 'ngx-papaparse';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { newValues, Values } from './models/values.model';
import { Category } from './models/categories.model';

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

  test(e?: any) {
    let hola = {
      categories: {
        car: '+12%',
        outlet: '-1%',
        bargain: '+5%+1€',
        home: '+3€-1%',
        music: '+3.1%',
        mobile: '+12€',
        '*': '+20%',
      },
    };
    console.log(Object.keys(hola.categories));
    console.log(Object.values(hola.categories));
    console.log(Object.values(this.json1['categories']));
    console.log(e);
  }

  getValues(stringValue: string): Values[] {
    let percent = '%';
    let currency = '€';
    let value: Values[] = [];
    let newArray = stringValue.split('');
    let tempStringValue: string;
    let reference = 0;

    for (let i = newArray.length - 1; i >= 0; i--) {
      if (newArray[i] === percent) {
        value.splice(reference, 0, { ...newValues });
        value[reference].unit = percent;
        value[reference].value = parseFloat(tempStringValue);
        tempStringValue = '';
        reference++;
      } else if (newArray[i] === currency) {
        value.splice(reference, 0, { ...newValues });
        value[reference].unit = currency;
        value[reference - 1].value = parseFloat(tempStringValue);
        tempStringValue = '';
        reference++;
      } else {
        tempStringValue = newArray[i] + tempStringValue;
        if (i === 0) {
          value[reference - 1].value = parseFloat(tempStringValue);
          return value;
        }
      }
    }
  }

  getCategories(fileName: any) {
    let categories: Category[];
    let fileKeys = Object.keys(fileName);
    let fileValues = Object.values(fileName);
    // for (let i = 0; i < fileKeys.length; i++) {
    //   let tempValue: Values;
    //   tempValue.title = fileKeys[i]
    //   tempValue.value = fileValues[i];
    //   test.push()

    // }
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
