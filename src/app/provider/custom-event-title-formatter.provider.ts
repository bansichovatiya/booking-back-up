import { LOCALE_ID, Inject, Injectable } from '@angular/core';
import { CalendarEventTitleFormatter, CalendarEvent } from 'angular-calendar';
import { formatDate } from '@angular/common';

@Injectable()
export class CustomEventTitleFormatter extends CalendarEventTitleFormatter {
  constructor(@Inject(LOCALE_ID) private locale: string) {
    super();
  }

  // you can override any of the methods defined in the parent class

  week(event: CalendarEvent): string {
    let startDate = "Start - " + formatDate(event.start, 'dd-MM-yyyy hh:mm a', this.locale);
    let endDate = event.end != null ? "End - " + formatDate(event.end, 'dd-MM-yyyy hh:mm a', this.locale) : '';
    let data  = event.meta.bookingType == 'Mht Booking'? `${event.meta.setUp}<br>${event.meta.eventPlace}` : '';
    return `<b>${event.title}</b><br>
            Type - ${event.meta.bookingType}<br>
            ${startDate}<br>
            ${endDate}<br>
            ${data}`;
  }

  day(event: CalendarEvent): string {
    let startDate = "Start - " + formatDate(event.start, 'dd-MM-yyyy hh:mm a', this.locale);
    let endDate = event.end != null ? "End - " + formatDate(event.end, 'dd-MM-yyyy hh:mm a', this.locale) : '';
    let data  = event.meta.bookingType == 'Mht Booking'? `${event.meta.setUp}<br>${event.meta.eventPlace}` : 
                event.meta.bookingType == 'Only Hall'? `${event.meta.eventPlace}`: '';
    return `<b>${event.title}</b><br>
            Type - ${event.meta.bookingType}<br>
            ${startDate}<br>
            ${endDate}<br>
            ${data}`;
  }
}