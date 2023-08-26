import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  // apiUrl: any = 'https://mhtapi.dadabhagwan.org/api/booking/';
  apiUrl: any = 'http://mhtapitest.dadabhagwan.org/api/booking/';
  // apiUrl: any = 'http://localhost:50655/api/booking/';
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
    let myParams = new HttpParams().set('itemid', itemid).set('date', '2023-03-18');
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

  GetGNCBookingDetails(itemid: string) {
    let myParams = new HttpParams().set('itemid', itemid).set('date', '2023-03-18');
    return this.http.get((this.apiUrl + 'getgncbookingdetails'), { params: myParams }).pipe(map(data => {
      return data;
    })
    )
  }

  InsertGNCBookingDetails(name: string, stime: string, etime: string, itemid: string, otherData: any) {
    let myParams = new HttpParams().set('name', name).set('stime', stime.toString()).set('etime', etime.toString()).set('itemid', itemid.toString())
    .set('btype', otherData.tatkalBookingType).set('setup', otherData.setUp).set('eplace', otherData.eventPlace).set('oplace', otherData.otherPlace)
    .set('equpiment', otherData.equipments.toString()).set('lpt', otherData.laptop.toString()).set('otherreq', otherData.otherRequirements).set('remarks', otherData.remarks);
    // , string btype, string setup, string eplace, string oplace, string equpiment, string lpt, string otherreq, string remarks
    
    return this.http.get((this.apiUrl + 'insertgncbookingdetails'), { params: myParams }).pipe(map(data => {
      return data;
    })
    )
  }

  UpdateGNCBookingDetails(name: string, stime: string, etime: string, itemid: string, bdid: string, otherData: any) {
    let myParams = new HttpParams().set('name', name).set('stime', stime.toString()).set('etime', etime.toString()).set('itemid', itemid.toString()).set('bdid', bdid.toString())
    .set('btype', otherData.tatkalBookingType).set('setup', otherData.setUp).set('eplace', otherData.eventPlace).set('oplace', otherData.otherPlace)
    .set('equpiment', otherData.equipments.toString()).set('lpt', otherData.laptop.toString()).set('otherreq', otherData.otherRequirements).set('remarks', otherData.remarks);
    // , string btype, string setup, string eplace, string oplace, string equpiment, string lpt, string otherreq, string remarks
    return this.http.get((this.apiUrl + 'updategncbookingdetails'), { params: myParams }).pipe(map(data => {
      return data;
    })
    )
  }

  DeleteGNCBookingDetails(bdid : string | number) {
    let myParams = new HttpParams().set('bdid', bdid as string);
    return this.http.get((this.apiUrl + 'deletegncbookingdetails'), { params: myParams }).pipe(map(data => {
      return data;
    })
    )
  }

}
