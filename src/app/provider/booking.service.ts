import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { EventData } from '../models/EventData';

@Injectable({
  providedIn: 'root'
})
export class BookingService {

  apiUrl: any = 'http://mhtapitest.dadabhagwan.org/api/booking/';

  constructor(private http: HttpClient) { }

  GetPersonName(name: string) {
    let myParams = new HttpParams().set('uname', name);
    return this.http.get((this.apiUrl + 'geticardusers'), { params: myParams })
      .subscribe(error => { console.log('err'); });
  }

  GetBookingType(type: string, category: string) {
    let myParams = new HttpParams().set('type', type).set('category', category);
    return this.http.get((this.apiUrl + 'getbookingtype'), { params: myParams }).pipe(map(data => {
      return data;
    })
    )
  }

  GetBookingDetails(itemid: string) {
    let myParams = new HttpParams().set('itemid', itemid);
    return this.http.get((this.apiUrl + 'getbookingdetails'), { params: myParams }).pipe(map(data => {
      return data;
    })
    )
  }

  InsertBookingDetails(name: string, stime: string, etime: string, itemid: string) {
    let myParams = new HttpParams().set('name', name).set('stime', stime.toString()).set('etime', etime.toString()).set('itemid', itemid.toString());
    return this.http.get((this.apiUrl + 'insertbookingdetails'), { params: myParams }).pipe(map(data => {
      return data;
    })
    )
  }

  UpdateBookingDetails(name: string, stime: string, etime: string, itemid: string, bdid: string) {
    let myParams = new HttpParams().set('name', name).set('stime', stime.toString()).set('etime', etime.toString()).set('itemid', itemid.toString()).set('bdid', bdid.toString());
    return this.http.get((this.apiUrl + 'updatebookingdetails'), { params: myParams }).pipe(map(data => {
      return data;
    })
    )
  }

  DeleteBookingDetails(bdid : string | number) {
    let myParams = new HttpParams().set('bdid', bdid as string);
    return this.http.get((this.apiUrl + 'deletebookingdetails'), { params: myParams }).pipe(map(data => {
      return data;
    })
    )
  }

  // Get Event place, equipment and purpose list
  GetGNCBookingType(){
    return this.http.get((this.apiUrl + 'getgncbookingtype')).pipe(map(data => {
      return data;
    }))
  }

  GetGNCBookingDetails(itemid: string) {
    let myParams = new HttpParams().set('itemid', itemid);
    return this.http.get((this.apiUrl + 'getgncbookingdetails'), { params: myParams }).pipe(map(data => {
      return data;
    })
    )
  }

  InsertGNCBookingDetails(eventData: EventData) {
   return this.http.post((this.apiUrl + 'insertgncbookingdetails'), eventData).pipe(map(data => {
      return data;
    })
    )
  }

  UpdateGNCBookingDetails(eventData: EventData) {
    return this.http.post((this.apiUrl + 'updategncbookingdetails'), eventData).pipe(map(data => {
      return data;
    })
    )
  }

  DeleteGNCBookingDetails(eventData: EventData) {
    return this.http.post((this.apiUrl + 'deletegncbookingdetails'), eventData).pipe(map(data => {
      return data;
    })
    )
  }

}
