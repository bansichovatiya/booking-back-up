import { Component, OnInit, ViewChild, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbAlert, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CalendarDateFormatter, CalendarEvent, CalendarEventTimesChangedEvent, CalendarEventTimesChangedEventType, CalendarMonthViewComponent, CalendarView, CalendarWeekViewComponent } from 'angular-calendar';
import { addDays, addMinutes, isSameDay, startOfMinute } from 'date-fns';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { Cloneable } from '../helper/cloneable';
import { ModalComponent } from '../modal/modal.component';
import { BookingService } from '../provider/booking.service';
import * as moment from "moment";
import { Constants } from '../helper/constants';
import { EventColor } from 'calendar-utils';
import { CustomDateFormatter } from '../provider/custom-date-formatter.provider';
import { IgxExcelExporterOptions, IgxExcelExporterService } from 'igniteui-angular';


@Component({
  selector: 'app-booking',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.css'],
  providers: [
    {
      provide: CalendarDateFormatter,
      useClass: CustomDateFormatter,
    },
  ],
})
export class BookingComponent implements OnInit, OnDestroy {
  viewDate: Date = moment().toDate();
  view: CalendarView = CalendarView.Day;
  CalendarView = CalendarView;
  events: CalendarEvent<{ ItemId: number }>[] = [];
  refresh = new Subject<void>();
  private _success = new Subject<string>();

  staticAlertClosed = false;
  selectedItemId: any;
  selectedName: any;
  selectedColor: any;
  types: any;
  selectedType: any;
  message = '';
  messageType = '';
  eventTypes: any;
  isrepeat: boolean = false;
  bookingDetails: any;
  daysInWeek = 7;
  excludeDays: number[] = [];
  category: any;
  starthour: any = 8;
  private destroy$ = new Subject<void>();
  @ViewChild('weekView') weekView: CalendarWeekViewComponent;
  @ViewChild('monthView') monthView: CalendarMonthViewComponent;
  @ViewChild('staticAlert', { static: false }) staticAlert: NgbAlert;
  @ViewChild('selfClosingAlert', { static: false }) selfClosingAlert: NgbAlert;
  calendarConfig = {
    weekStartsOn: 1 // Monday is the first day of the week
  };
  constructor(private modalService: NgbModal,
    private bookingService: BookingService,
    private cd: ChangeDetectorRef,
    private route: ActivatedRoute,
    private excelExportService: IgxExcelExporterService,
  ) { }

  ngOnInit(): void {
    setTimeout(() => {
      if (this.staticAlert)
        this.staticAlert.close()
    }, 20000);

    this._success.subscribe((message) => (this.message = message));
    this._success.pipe(debounceTime(5000)).subscribe(() => {
      if (this.selfClosingAlert) {
        this.selfClosingAlert.close();
      }
    });
    if (!this.eventTypes)
      this.getBookingType();
  }

  async getBookingType() {
    let catParam = this.route.snapshot.routeConfig.path;
    this.category = ((catParam.includes('oldsankul') && catParam == '@oldsankul1958') ? 'Old Sankul' : (catParam.includes('newsankul') && catParam == '@newsankul1968') ? 'New Sankul' : 'All');
    await this.bookingService.GetBookingType('', this.category).subscribe((data) => {
      if (data && data.length > 0) {
        this.types = data;
        this.selectedType = this.types[0].Type;
        this.OnTypeChange(this.selectedType);
      }
    });
  }

  async OnTypeChange(type) {
    // exclude sunday when type is Vehicle.
    if (type == "Vehicle"){
      this.excludeDays.push(0);
      if (this.view == CalendarView.Day && this.viewDate.getDay() == 0){
        this.viewDate = addDays(this.viewDate, 1);
      }
    }
    else if (this.excludeDays.length){
      this.excludeDays.length = 0;
    }

    this.refresh.next();

    await this.bookingService.GetBookingType(type, this.category).subscribe((data) => {
      if (data && data.length > 0) {
        this.eventTypes = data;
        this.starthour = this.eventTypes[0].StartHour;
        this.selectedItemId = this.eventTypes[0].Itid;
        this.selectedName = this.eventTypes[0].Name;
        this.selectedColor = this.eventTypes[0].Color;
        this.events = [];
        this.getBookingDetails();
      }
    });
  }

  onChange(name) {
    this.selectedName = name;
    this.selectedColor = this.eventTypes.find(t => t.Name == name).Color;
    this.selectedItemId = this.eventTypes.find(t => t.Name == name).Itid;
    this.events = [];
    this.getBookingDetails();
  }

  async getBookingDetails() {
    let ItemId = this.eventTypes.find(t => t.Name == this.selectedName).Itid;
    // let date = moment(this.viewDate).format('YYYY-MM-DD');
    await this.bookingService.GetBookingDetails(ItemId).subscribe((data) => {
      if (data && data.length > 0) {
        this.bookingDetails = data;
        this.bookingDetails.forEach(element => {
          let event: CalendarEvent<{ "ItemId": number }> = {
            id: element.bdid,
            title: element.Person_Name,
            start: moment(element.Stime, 'YYYY-MM-DDTHH:mm:ssZ').toDate(),
            end: moment(element.Etime, 'YYYY-MM-DDTHH:mm:ssZ').toDate(),
            color: Constants.getColorbyName(this.selectedColor),
            meta: {
              ItemId: element.Itid,
            },
            // draggable: true,
            // resizable: {
            //   beforeStart: true, // this allows you to configure the sides the event is resizable from
            //   afterEnd: true,
            // },
          }
          this.events.push(event);
        });
      }
      else {
        this.events = [];
      }
      this.cd.detectChanges();
      this.refresh.next();
    });

  }

  public addAlertMessage(type: string, message: string) {
    this.messageType = type;
    this._success.next(message);
  }

  setView(view: CalendarView) {
    this.view = view;
  }

  dayClicked({ date, events }: { date: Date; events: CalendarEvent<{ ItemId: number }>[] }): void {
    this.viewDate = date;
    this.view = CalendarView.Day;
  }

  eventClicked({ event }: { event: CalendarEvent<{ ItemId: number }> }): void {
    const getdate = moment(event.end, 'YYYY-MM-DDTHH:mm:ssZ').toDate();
    const curdate = moment().toDate();
    if (getdate >= curdate)
      this.openEventModal(event, 'edit');
    else
      ////alert('Past times can not be added or edited')
      this.openEventModal(event, 'view');
  }

  hourSegmentClicked(date: Date) {
    let newEvent: CalendarEvent<{ ItemId: number }> = {
      id: null,
      title: '',
      start: startOfMinute(date),
      end: addMinutes(startOfMinute(date), 30),
      color: Constants.getColorbyName(this.selectedColor),
      meta: {
        ItemId: this.selectedItemId,
      },
    }

    const startTimeStamp = moment(newEvent.start, 'YYYY-MM-DDTHH:mm:ssZ').toDate().getTime();
    const endTimeStamp = moment(newEvent.end, 'YYYY-MM-DDTHH:mm:ssZ').toDate().getTime();
    const isEventExist = this.events.some((event) => {
      const eventStartTime = event.start.getTime();
      const eventEndTime = event.end.getTime();
      return (
        (eventStartTime >= startTimeStamp && eventStartTime < endTimeStamp) || // event start time falls between the given range
        (eventEndTime > startTimeStamp && eventEndTime <= endTimeStamp) || // event end time falls between the given range
        (eventStartTime <= startTimeStamp && eventEndTime >= endTimeStamp) // event spans the entire given range
      );
    });
    const getdate = moment(newEvent.start, 'YYYY-MM-DDTHH:mm:ssZ').toDate();
    const curdate = moment().toDate();
    if (!isEventExist) {
      if (getdate >= curdate)
        this.openEventModal(newEvent, 'add');
      else
        alert('Past times can not be added or edited.')
    }


  };

  openEventModal(event: CalendarEvent<{ ItemId: number }>, action: string) {
    let deepCopyEvent = Cloneable.deepCopy(event);
    const modalRef = this.modalService.open(ModalComponent);
    modalRef.componentInstance.event = deepCopyEvent;
    modalRef.componentInstance.selectedName = this.selectedName;
    modalRef.componentInstance.selectedColor = this.selectedColor;
    modalRef.componentInstance.eventList = this.events;
    modalRef.componentInstance.action = action;
    modalRef.componentInstance.startHour = this.starthour;
    modalRef.result.then((result) => {
      if (result == 'delete') {
        this.bookingService.DeleteBookingDetails(event.id)
          .subscribe((data) => {
            if(data) {
              this.events = this.events.filter((e) => e !== event);
            this.refresh.next();
            }
          });
      }
      else if (result && action == 'add') {
        let calendarEventTimesChangedEvent: CalendarEventTimesChangedEvent = {
          type: CalendarEventTimesChangedEventType.Resize,
          event: result,
          newStart: result.start,
          newEnd: result.end
        }
        if (this.validateEventTimesChanged(calendarEventTimesChangedEvent, result.meta.ItemId)) {
         
          let stime = moment(result.start).format('YYYY-MM-DD HH:mm:ss');
          let etime = moment(result.end).format('YYYY-MM-DD HH:mm:ss');
          this.bookingService.InsertBookingDetails(result.title, stime, etime, result.meta.ItemId)
            .subscribe((data) => {
              if (data && data.length > 0 && data[0].bdid) {
                result.id = data[0].bdid;
                this.events = [
                  ...this.events,
                  result,
                ];
                this.refresh.next();
              }
            });
        }
        else {
          alert("Conflicts with existing booking.");
        }
        this.refresh.next();
      }
      else if (result && action == 'edit') {
        let calendarEventTimesChangedEvent: CalendarEventTimesChangedEvent = {
          type: CalendarEventTimesChangedEventType.Resize,
          event: event,
          newStart: result.start,
          newEnd: result.end
        }
        if (this.validateEventTimesChanged(calendarEventTimesChangedEvent, result.meta.ItemId)) {
          let stime = moment(result.start).format('YYYY-MM-DD HH:mm:ss');
          let etime = moment(result.end).format('YYYY-MM-DD HH:mm:ss');
          this.bookingService.UpdateBookingDetails(result.title, stime, etime, result.meta.ItemId, result.id)
            .subscribe((data) => {
              if(data) {
                event.title = result.title;
                event.start = result.start;
                event.end = result.end;
                this.refresh.next();
              }
            });
        }
        else {
          alert("Conflicts with existing booking.");
        }
      }
    },
      (reason) => {
      });
  }

  validateEventTimesChanged = (
    { event, newStart, newEnd, }: CalendarEventTimesChangedEvent, metaItem: number) => {

    // don't allow dragging or resizing events to different days
    const sameDay = isSameDay(newStart, newEnd);

    if (!sameDay) {
      return false;
    }

    // don't allow dragging events to the same times as other events
    const overlappingEvent = this.events.find((otherEvent) => {
      return (
        otherEvent !== event &&
        !otherEvent.allDay && otherEvent.meta.ItemId == metaItem &&
        ((otherEvent.start < newStart && newStart < otherEvent.end) ||
          (otherEvent.start < newEnd && newStart < otherEvent.end))
      );
    });

    if (overlappingEvent)
      return false;

    return true;
  };

  eventTimesChanged({
    event,
    newStart,
    newEnd,
  }: CalendarEventTimesChangedEvent): void {
    
    this.bookingService.UpdateBookingDetails(
      event.title,
      moment(newStart).format('YYYY-MM-DD HH:mm:ss'),
      moment(newEnd).format('YYYY-MM-DD HH:mm:ss'),
      event.meta.ItemId,
      event.id.toString())
      .subscribe((data) => {
        if(data) {
          event.start = newStart;
          event.end = newEnd;
          this.refresh.next();
        }
      });
  }

  public exportData() {
    let fileName = "BookingDetails_" + this.selectedType + "_" + this.selectedName;
    let exportDataList = [];
    let i = 1;
    this.events.forEach(element => {
      let event = {
        'Sr No': i,
        'Person Name': element.title,
        'Date': moment(element.start).format('DD-MM-YYYY'),
        'Start Time': moment(element.start).format('hh:mm A'),
        'End Time': moment(element.end).format('hh:mm A'),
      }
      exportDataList.push(event);
      i++;
    });
    this.excelExportService.exportData(exportDataList, new IgxExcelExporterOptions(fileName));
  }

  ngOnDestroy() {
    this.destroy$.next();
  }

}
