import { Component, OnDestroy, OnInit } from '@angular/core';
import { Papa, ParseResult } from 'ngx-papaparse';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { Values, newValues } from './models/values.model';
import { Category, newCategory } from './models/categories.model';
import { Profit, newProfit } from './models/profit.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  constructor(private papa: Papa, private http: HttpClient) {}

  csv1Subs: Subscription;
  csv1: Array<string>;
  json1Subs: Subscription;
  json1: Object;
  csv2Subs: Subscription;
  csv2: Array<string>;
  json2Subs: Subscription;
  json2: Object;

  ngOnInit(): void {
    this.csv1Subs = this.http
      .get('../assets/csvFile/example1/example1.csv', { responseType: 'text' })
      .subscribe((data) => {
        this.papa.parse(data, {
          complete: (result) => {
            this.csv1 = result.data;
          },
        });
      });
    this.json1Subs = this.http
      .get('../assets/csvFile/example1/example1.json', { responseType: 'text' })
      .subscribe((data) => {
        let temp = JSON.parse(data);
        this.json1 = temp['categories'];
      });

    this.csv2Subs = this.http
      .get('../assets/csvFile/example2/example2.csv', { responseType: 'text' })
      .subscribe((data) => {
        this.papa.parse(data, {
          complete: (result) => {
            this.csv2 = result.data;
          },
        });
      });
    this.json2Subs = this.http
      .get('../assets/csvFile/example2/example2.json', { responseType: 'text' })
      .subscribe((data) => {
        let temp = JSON.parse(data);
        this.json2 = temp['categories'];
      });
  }

  getCostValue(stringCostValue: string): string {
    let newArray = stringCostValue.split('');
    for (let i = 0; i < newArray.length; i++) {
      if (newArray[i] === '.') {
        newArray.splice(i, 1);
        i++;
      } else if (newArray[i] === ',') {
        newArray[i] = '.';
      }
      if (i === newArray.length - 1) {
        return newArray.join('');
      }
    }
  }
  getFormuleValue(stringCostValue: string): string {
    let newArray = stringCostValue.split('');
    for (let i = 0; i < newArray.length; i++) {
      if (newArray[i] === '.') {
        newArray.splice(i, 1);
        i++;
      } else if (newArray[i] === ',') {
        newArray[i] = '.';
      }
      if (i === newArray.length - 1) {
        return newArray.join('');
      }
    }
  }

  getProfit(fileName: Array<string>, categoriesFile: Object): Profit[] {
    let categories = this.getCategories(categoriesFile);
    let resp: Profit[] = [];
    let categoryIndex: number = fileName[0].indexOf('CATEGORY');
    let costIndex: number = fileName[0].indexOf('COST');
    let quantityIndex: number = fileName[0].indexOf('QUANTITY');
    let categoryFound: Category;
    let categotyDefault: Category;
    let exist: boolean;
    let existIndex: number;
    for (let i = 1; i < fileName.length; i++) {
      if (resp.length === 0) {
        resp.splice(0, 0, { ...newProfit });
        resp[resp.length - 1].category = fileName[i][categoryIndex];
      } else if (resp.length > 0) {
        resp.forEach((data: Profit, a) => {
          if (data.category === fileName[i][categoryIndex]) {
            existIndex = a;
            exist = true;
          }
        });
        if (!exist) {
          resp.splice(resp.length, 0, { ...newProfit });
          resp[resp.length - 1].category = fileName[i][categoryIndex];
        }
      }
      categoryFound = null;
      categories.forEach((category: Category) => {
        if (category.category === fileName[i][categoryIndex]) {
          categoryFound = category;
        } else if (category.category === '*') {
          categotyDefault = category;
        }
      });
      if (categoryFound === null) {
        categoryFound = categotyDefault;
      }
      let cost = parseFloat(this.getCostValue(fileName[i][costIndex]));
      let costTemp = 0;
      categoryFound.value.forEach((values: Values) => {
        values.unit === '%'
          ? (costTemp =
              costTemp +
              cost *
                (values.value / 100) *
                parseFloat(this.getCostValue(fileName[i][quantityIndex])))
          : (costTemp =
              costTemp + parseFloat(fileName[i][quantityIndex]) * values.value);
      });
      if (exist) {
        resp[existIndex].profit = resp[existIndex].profit + costTemp;
      } else {
        resp[resp.length - 1].profit = costTemp;
      }
      if (i === fileName.length-1) {
        console.log(resp);
        return resp
      }
      categoryFound = null;
      existIndex = 0;
      exist = false;
    }
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
        if (reference > 0) {
          value[reference - 1].value = parseFloat(tempStringValue);
        }
        tempStringValue = '';
        reference++;
      } else if (newArray[i] === currency) {
        value.splice(reference, 0, { ...newValues });
        value[reference].unit = currency;
        if (reference > 0) {
          value[reference - 1].value = parseFloat(tempStringValue);
        }
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

  getCategories(fileName: Object): Category[] {
    let categories: Category[] = [];
    let fileKeys: string[] = Object.keys(fileName);
    let fileValues: string[] = Object.values(fileName);
    for (let i = 0; i < fileKeys.length; i++) {
      categories.splice(i, 0, { ...newCategory });
      categories[i].category = fileKeys[i];
      categories[i].value = this.getValues(fileValues[i]);
      if (i === fileKeys.length - 1) {
        return categories;
      }
    }
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
