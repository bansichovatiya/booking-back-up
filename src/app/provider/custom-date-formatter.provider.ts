import { CalendarDateFormatter, DateFormatterParams } from 'angular-calendar';
import { formatDate } from '@angular/common';
import { Injectable } from '@angular/core';

@Injectable()
export class CustomDateFormatter extends CalendarDateFormatter {
  // you can override any of the methods defined in the parent class

  public monthViewColumnHeader({ date, locale }: DateFormatterParams): string {
    return formatDate(date, 'EEE', locale).charAt(0);
  }

  public weekViewColumnHeader({ date, locale }: DateFormatterParams): string {
    return formatDate(date, 'E', locale).charAt(0);
  }

  public weekViewColumnSubHeader({ date, locale }: DateFormatterParams): string {
    return formatDate(date, 'd', locale);
  }
  
  public dayViewHour({ date, locale }: DateFormatterParams): string {
    return formatDate(date, 'h a', locale);
  }
}