import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BookingComponent } from './booking/booking.component';
import { GncBookingComponent } from './gnc-booking/gnc-booking.component';

const routes: Routes = [
  { path: '', component: BookingComponent, pathMatch: 'full' },
  { path: '@oldsankul1958', component: BookingComponent },
  { path: '@newsankul1968', component: BookingComponent },
  { path: 'gnc', component: GncBookingComponent },
];

@NgModule({
  // imports: [RouterModule.forRoot(routes, { useHash: true })],
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
