import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { NgbAlertModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ModalComponent } from './modal/modal.component';
import { BookingComponent } from './booking/booking.component';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { IgxExcelExporterService, IgxGridModule, IgxIconModule } from 'igniteui-angular';
import { GncBookingComponent } from './gnc-booking/gnc-booking.component';
import { GncEventModalComponent } from './gnc-event-modal/gnc-event-modal.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import 'zinggrid';

@NgModule({
  declarations: [
    AppComponent,
    ModalComponent,
    BookingComponent,
    GncBookingComponent,
    GncEventModalComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgbModule,
    FormsModule,
    HttpClientModule,
    NgbAlertModule,
    NgMultiSelectDropDownModule.forRoot(),
    IgxIconModule,
    IgxGridModule,
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory,
    })
  ],
  providers: [ IgxExcelExporterService ],
  bootstrap: [AppComponent]
})
export class AppModule { }
