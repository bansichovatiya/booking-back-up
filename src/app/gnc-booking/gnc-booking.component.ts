import { Component, OnInit, ViewChild, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef, Inject, LOCALE_ID, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CalendarDateFormatter, CalendarEvent, CalendarEventTitleFormatter, CalendarMonthViewComponent, CalendarView, CalendarWeekViewComponent } from 'angular-calendar';
import { addDays, addHours, addMinutes, differenceInBusinessDays, differenceInCalendarDays, endOfMinute, isSameDay, isToday, startOfHour, startOfMinute } from 'date-fns';
import { Subject } from 'rxjs'
import { Cloneable } from '../helper/cloneable';
import { BookingService } from '../provider/booking.service';
import * as moment from "moment";
import { Constants } from '../helper/constants';
import { CustomDateFormatter } from '../provider/custom-date-formatter.provider';
import { CustomEventTitleFormatter } from '../provider/custom-event-title-formatter.provider';
import { formatDate } from '@angular/common';
import { IgxExcelExporterOptions, IgxExcelExporterService } from 'igniteui-angular';
import { GncEventModalComponent } from '../gnc-event-modal/gnc-event-modal.component';
import { EventData } from '../models/EventData';
import 'zinggrid';

@Component({
  selector: 'app-gnc-booking',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './gnc-booking.component.html',
  styleUrls: ['./gnc-booking.component.css'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: CalendarDateFormatter,
      useClass: CustomDateFormatter,
    },
    {
      provide: CalendarEventTitleFormatter,
      useClass: CustomEventTitleFormatter,
    },
  ],
})
export class GncBookingComponent implements OnInit, OnDestroy {
  viewList = 'List';
  viewDate: Date = moment().toDate();
  view: any = CalendarView.Day;
  CalendarView = CalendarView;
  events: CalendarEvent<any>[] = [];
  eventsByItemId: CalendarEvent<any>[] = [];
  refresh = new Subject<void>();
  sortDirection = 'asc';
  selectedItemId: any;
  selectedName: any;
  selectedColor: any;
  types: any;
  selectedType: any;
  message = '';
  messageType = '';
  eventTypes: any[] = [{"Itid": 0,"Type": "GNC", "Name": "All (View Only)", "Color": "blue", "Category": "GNC", "IsActive": true, "StartHour": 9}];
  isrepeat: boolean = false;
  bookingDetails: any;
  daysInWeek = 7;
  category: any = 'GNC';
  starthour: any = 8;
  private destroy$ = new Subject<void>();
  @ViewChild('weekView')
  weekView!: CalendarWeekViewComponent;
  @ViewChild('monthView')
  monthView!: CalendarMonthViewComponent;
  listDetials: any;
  calendarConfig = {
    weekStartsOn: 1 // Monday is the first day of the week
  };
  allItemId = 0;
  allEventPlaces: any[];
  allEquipments: any[];
  allPurposeList: any[];

  constructor(private modalService: NgbModal,
    private bookingService: BookingService,
    private cd: ChangeDetectorRef,
    private route: ActivatedRoute,
    @Inject(LOCALE_ID) private locale: string,
    private excelExportService: IgxExcelExporterService) { }

  ngOnInit(): void {
    this.getGNCBookingTypeData();
    if (this.eventTypes.length == 1)
      this.getBookingType();
  }

  async getGNCBookingTypeData(){
    await this.bookingService.GetGNCBookingType().subscribe((data: any[]) => {
      if (data && data.length > 0) {
        this.allEventPlaces = data.filter(x => x.Detail == "EventPlaces");
        this.allEquipments = data.filter(x => x.Detail == "Equipments");
        this.allPurposeList = data.filter(x => x.Detail == "Purpose");
      }
    });
  }

  async getBookingType() {
    await this.bookingService.GetBookingType('', this.category).subscribe((data) => {
      if (data && data.length > 0) {
        this.types = data;
        if (this.types.length > 0) {
          this.selectedType = this.types[0].Type;
          this.OnTypeChange(this.selectedType);
        }
      }
    });

  }

  async OnTypeChange(type) {
    await this.bookingService.GetBookingType(type, this.category).subscribe((data: any[]) => {
      if(data && data.length > 0){
        data.forEach((element) => {
          this.eventTypes.push(element);
        });
        this.starthour = this.eventTypes[0].StartHour;
        this.selectedItemId = this.eventTypes[0].Itid;
        this.selectedName = this.eventTypes[0].Name;
        this.selectedColor = this.eventTypes[0].Color;
        this.events = [];
        this.eventsByItemId = [];
        this.getBookingDetails();
      }
    });
  }

  onChange(name) {
    this.selectedName = name;
    this.selectedColor = this.eventTypes.find(t => t.Name == name).Color;
    this.selectedItemId = this.eventTypes.find(t => t.Name == name).Itid;
    this.events = [];
    this.eventsByItemId = [];
    this.getBookingDetails();
  }

  async getBookingDetails() {
    // Required all events for filter event place and equipments in modal and to show by selected type from dropdown.
    let ItemId = this.eventTypes.find((t: { Name: any; }) => t.Name == this.selectedName).Itid;
    await this.bookingService.GetGNCBookingDetails('0').subscribe((data) => {
      if (data && data.length > 0) {
        this.bookingDetails = data;
        this.listDetials = [];
        this.bookingDetails.forEach((element) => {
          let equipments: string[] = element.Equipments ? element.Equipments.split(',') : [];
          let currentDate = new Date();
          let event: CalendarEvent<any> = {
            id: element.bdid,
            title: element.Person_Name,
            start: moment(element.Stime, 'YYYY-MM-DDTHH:mm:ssZ').toDate(),
            end: moment(element.Etime, 'YYYY-MM-DDTHH:mm:ssZ').toDate(),
            color: Constants.getColorbyName(element.Color),
            meta: {
              itemId: element.Itid,
              bookingType: element.BookingType,
              setUp: element.SetUp,
              eventPlace: element.EventPlace,
              otherPlace: element.OtherPlace,
              equipments: equipments,
              otherRequirements: element.OtherRequirments,
              purpose: element.Purpose,
              otherPurpose: element.OtherPurpose,
              isFixedSetup: element.IsFixedSetup,
              sendEmail: element.SendEmail,
              ispast: (new Date(element.Etime) > currentDate ? false : true)
            },
          }
          this.events.push(event);
          const flattenedElement = this.flattenMeta(event);
          this.listDetials.push(flattenedElement);
        });

        if(this.selectedItemId != this.allItemId){
          this.eventsByItemId = this.events.filter(e => e.meta.itemId == ItemId);
        }
        else{
          this.eventsByItemId = this.events;
        }
      }
      else {
        this.events = [];
        this.eventsByItemId = [];
      }
      this.cd.detectChanges();
      this.refresh.next();
    });
  }

  flattenMeta(meta: any): any {
    const flattenedMeta: any = {};
    flattenedMeta['start'] = this.getFormatDateString(meta.start);
    flattenedMeta['end'] = this.getFormatDateString(meta.end);
    for (const key in meta) {
      if (meta.hasOwnProperty(key)) {
        if (typeof meta[key] === 'object' && meta[key] !== null) {
          const nestedKeys = Object.keys(meta[key]);
          for (const nestedKey of nestedKeys) {
            if (nestedKey == 'itemId') {
              flattenedMeta[`${nestedKey}`] = this.getDepartmentbyItemID(meta[key][nestedKey]);
            }
            else if (nestedKey == 'equipments') {
              flattenedMeta[`${nestedKey}`] = meta[key][nestedKey].join('</br>');
            }
            else if(nestedKey == 'eventPlace' && meta.meta.eventPlace == 'Other'){
              flattenedMeta[`${nestedKey}`] = 'Other - '+ meta.meta.otherPlace;
            }
            else if(nestedKey == 'purpose' && meta.meta.purpose == 'Other'){
              flattenedMeta[`${nestedKey}`] = 'Other - '+ meta.meta.otherPurpose;
            }
            else if(nestedKey == 'isFixedSetup' && meta.meta.isFixedSetup != null){
              flattenedMeta[`${nestedKey}`] = meta.meta.isFixedSetup ? 'Yes' : 'No';
            }
            else {
              flattenedMeta[`${nestedKey}`] = meta[key][nestedKey];
            }
          }
        } else {
          flattenedMeta[key] = meta[key];
        }
      }
    }
    return flattenedMeta;
  }

  setView(view: any) {
    this.view = view;
    if (this.view == 'List') {
      const component = this;
      setTimeout(function () {
        const zgRef = document.querySelector('zing-grid');
        zgRef.addEventListener('record:click', (event: any) => {
          const { ZGData, ZGEvent, ZGTarget } = event.detail;
          let currentevent = ZGData.data.id;
          let editEvent = component.events.find(e => e.id == currentevent);
          component.eventClicked({ event: editEvent });
        });
      }, 2000);
    }
  }

  dayClicked({ date }: { date: Date }): void {
    this.viewDate = date;
    this.view = CalendarView.Day;
  }

  eventClicked({ event }: { event: CalendarEvent<any> }): void {
    const getdate = moment(event.end, 'YYYY-MM-DDTHH:mm:ssZ').toDate();
    const curdate = moment().toDate();
    if ((this.view == 'List' || this.selectedItemId != this.allItemId) && getdate >= curdate)
      this.openEventModal(event, 'edit');
    else
      this.openEventModal(event, 'view');
  }

  hourSegmentClicked(date: Date) {
    if(this.selectedItemId != this.allItemId){
      let newEvent: CalendarEvent<any> = {
        id: null,
        title: '',
        start: startOfMinute(date),
        end: addHours(startOfMinute(date), 1),
        color: Constants.getColorbyName(this.selectedColor),
        meta: {
          itemId: this.selectedItemId,
          bookingType: null,
          setUp: null,
          eventPlace: null,
          otherPlace: null,
          equipments: [],
          otherRequirements: null,
          purpose: null,
          otherPurpose: null,
          isFixedSetup: null,
          sendEmail: false
        },
      }
  
      const getdate = moment(newEvent.start, 'YYYY-MM-DDTHH:mm:ssZ').toDate();
      const curdate = moment().toDate();
  
      if (getdate >= curdate)
        this.openEventModal(newEvent, 'add');
      else
        alert('Past times can not be added or edited.');
    }
  };

  openEventModal(event: CalendarEvent<any>, action: string) {
    let deepCopyEvent = Cloneable.deepCopy(event);
    const modalRef = this.modalService.open(GncEventModalComponent, { backdrop: 'static', keyboard: false });
    modalRef.componentInstance.selectedItemId = this.selectedItemId;
    modalRef.componentInstance.event = deepCopyEvent;
    modalRef.componentInstance.eventList = this.events;
    modalRef.componentInstance.action = action;
    modalRef.componentInstance.startHour = this.starthour;
    modalRef.componentInstance.allEventPlaces = this.allEventPlaces;
    modalRef.componentInstance.allEquipments = this.allEquipments;
    modalRef.componentInstance.allPurposeList = this.allPurposeList;

    modalRef.result.then((result) => {
      if (result == 'delete') {
        if (event.id) {
          let eventData = new EventData(event);
          this.bookingService.DeleteGNCBookingDetails(eventData)
            .subscribe((data) => {
              if(data) {
                this.eventsByItemId = this.eventsByItemId.filter((e) => e !== event);
                this.events = this.events.filter((e) => e !== event);
                this.listDetials = this.listDetials.filter((e) => e.id !== event.id);
                this.refreshZingGrid();
                this.cd.detectChanges();
              }
            });
        }
      }
      else if (result == 'duplicate') {
        let duplicateEvent = Cloneable.deepCopy(event);
        duplicateEvent.id = null;
        let today = new Date();
        let eventdays = differenceInCalendarDays(duplicateEvent.end, duplicateEvent.start);
        duplicateEvent.start.setDate(today.getDate());
        duplicateEvent.end = addDays(duplicateEvent.start, eventdays);
        duplicateEvent.end.setHours(event.end.getHours(), event.end.getMinutes());
        this.openEventModal(duplicateEvent, 'add');
      }
      else if (result && action == 'add') {
        let eventData = new EventData(result);
        eventData["department"] = this.getDepartmentbyItemID(Number(eventData.itemid));
        this.bookingService.InsertGNCBookingDetails(eventData)
          .subscribe((data: EventData[]) => {
            if (data && data.length > 0 && data[0].bdid) {
              result.id = data[0].bdid;
              this.eventsByItemId = [
                ...this.eventsByItemId,
                result,
              ];
              this.events = [
                ...this.events,
                result,
              ];
              this.refresh.next();
              let updatedval = this.flattenMeta(result);
              this.listDetials.unshift(updatedval);
              this.refreshZingGrid();
              this.cd.detectChanges();
            }
          });
      }
      else if (result && action == 'edit') {
        let eventData = new EventData(result);
        this.bookingService.UpdateGNCBookingDetails(eventData)
          .subscribe((data) => {
            if (data) {
              event.title = result.title;
              event.start = result.start;
              event.end = result.end;
              event.meta = result.meta;
              this.refresh.next();
              let updatedval = this.flattenMeta(event);
              const indexToReplace = this.listDetials.findIndex(item => item.id === updatedval.id);
              if (indexToReplace !== -1) {
                this.listDetials[indexToReplace] = updatedval;
              }
              this.refreshZingGrid();
              this.cd.detectChanges();
            }
          });
      }

      this.refresh.next();
      this.refreshZingGrid();
      this.cd.detectChanges();
      if (this.view == this.viewList) {
        this.cd.detectChanges();
      }
    },
      (reason) => {
      });
  }

  refreshZingGrid() {
    if (this.view == 'List') {
      let refgrid = document.querySelector('zing-grid');
      refgrid.refresh();
    }
  }
  public exportData() {
    let fileName = "BookingDetails_" + this.selectedType;
    let exportDataList: any[] = [];
    let i = 1;
    this.events.forEach(element => {
      let department = this.getDepartmentbyItemID(element.meta.itemId);
      let fixedSetup = element.meta.isFixedSetup != null ? (element.meta.isFixedSetup ? 'Yes' : 'No') : null;
      let data = ``;
      element.meta.equipments.forEach((e: string) => {
        data = `${data}\n${e}`;
      });

      let event = {
        'Sr No': i,
        'Type': element.meta.bookingType,
        'Department': department,
        'Person Name': element.title,
        'Pick up/Start DateTime': moment(element.start).format('DD-MM-YYYY hh:mm A'),
        'Return/End DateTime': moment(element.end).format('DD-MM-YYYY hh:mm A'),
        'Set up': element.meta.setUp,
        'Event Place': element.meta.eventPlace == 'Other' ? 'Other - '+ element.meta.otherPlace : element.meta.eventPlace,
        'Equipments': data,
        'Other Requirements': element.meta.otherRequirements,
        'Purpose': element.meta.purpose == 'Other' ? 'Other - '+ element.meta.otherPurpose : element.meta.purpose,
        'Fixed Setup': fixedSetup,
      }
      exportDataList.push(event);
      i++;
    });
    this.excelExportService.exportData(exportDataList, new IgxExcelExporterOptions(fileName));
  }

  getFormatDateString(date: Date | undefined) {
    if (date)
      return formatDate(date, 'dd-MM-yyyy hh:mm a', this.locale);
    return '';
  }

  getDepartmentbyItemID(itemId: number) {
    return this.eventTypes.find((t: { Itid: number; }) => t.Itid == itemId).Name;
  }

  ngOnDestroy() {
    this.destroy$.next();
  }

  sort(property: string) {
    this.events.sort((a, b) => {
      const direction = a[property] > b[property] ? 1 : -1;
      return this.sortDirection === 'asc' ? direction : -direction;
    });

    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
  }
}
