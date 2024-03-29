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
    let data  = event.meta.bookingType == 'Activity Booking'? `${event.meta.setUp}<br>
                  ${event.meta.eventPlace == 'Other' ? 'Other - '+ event.meta.otherPlace : event.meta.eventPlace}` : '';
    let laptopItems = event.meta.equipments.filter(x=> x.includes("Laptop"));
    let items = laptopItems.length == 0 ? '': laptopItems.join(', ') + '<br>';
    return `<b>${event.title}</b> (${event.meta.bookingType})<br>
            ${items}
            ${startDate}<br>
            ${endDate}<br>
            ${data}`;
  }

  day(event: CalendarEvent): string {
    let startDate = "Start - " + formatDate(event.start, 'dd-MM-yyyy hh:mm a', this.locale);
    let endDate = event.end != null ? "End - " + formatDate(event.end, 'dd-MM-yyyy hh:mm a', this.locale) : '';
    let data  = event.meta.bookingType == 'Activity Booking'? `${event.meta.setUp}<br>
                  ${event.meta.eventPlace == 'Other' ? 'Other - '+ event.meta.otherPlace : event.meta.eventPlace}` : '';
    let laptopItems = event.meta.equipments.filter(x=> x.includes("Laptop"));
    let items = laptopItems.length == 0 ? '': '- ' + laptopItems.join(', ');
    return `<b>${event.title}</b> (${event.meta.bookingType}) ${items}<br>
            ${startDate}<br>
            ${endDate}<br>
            ${data}`;
  }
}