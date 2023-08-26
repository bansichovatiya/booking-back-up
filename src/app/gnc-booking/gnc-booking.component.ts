import { Component, OnInit, ViewChild, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef, Inject, LOCALE_ID } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CalendarDateFormatter, CalendarEvent, CalendarEventTitleFormatter, CalendarMonthViewComponent, CalendarView, CalendarWeekViewComponent } from 'angular-calendar';
import { addDays, addHours, addMinutes, startOfMinute } from 'date-fns';
import { Subject } from 'rxjs'
import { Cloneable } from '../helper/cloneable';
import { BookingService } from '../provider/booking.service';
import * as moment from "moment";
import { Constants } from '../helper/constants';
import { EventColor } from 'calendar-utils';
import { CustomDateFormatter } from '../provider/custom-date-formatter.provider';
import { CustomEventTitleFormatter } from '../provider/custom-event-title-formatter.provider';
import { formatDate } from '@angular/common';
import { IgxExcelExporterOptions, IgxExcelExporterService } from 'igniteui-angular';
import { GncEventModalComponent } from '../gnc-event-modal/gnc-event-modal.component';

@Component({
  selector: 'app-gnc-booking',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './gnc-booking.component.html',
  styleUrls: ['./gnc-booking.component.css'],
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
  category: any = 'GNC';
  starthour: any = 8;
  private destroy$ = new Subject<void>();
  @ViewChild('weekView')
  weekView!: CalendarWeekViewComponent;
  @ViewChild('monthView')
  monthView!: CalendarMonthViewComponent;
  calendarConfig = {
    weekStartsOn: 1 // Monday is the first day of the week
  };

  constructor(private modalService: NgbModal,
    private bookinService: BookingService,
    private cd: ChangeDetectorRef,
    private route: ActivatedRoute,
    @Inject(LOCALE_ID) private locale: string,
    private excelExportService: IgxExcelExporterService) { }

  ngOnInit(): void {
    if (!this.eventTypes)
      this.getBookingType();
  }

  async getBookingType() {
    await this.bookinService.GetBookingType('', this.category).subscribe((data) => {
      this.types = data;
      if (this.types.length > 0) {
        this.selectedType = this.types[0].Type;
        this.OnTypeChange(this.selectedType);
      }
    });

  }

  async OnTypeChange(type) {
    await this.bookinService.GetBookingType(type, this.category).subscribe((data) => {
      this.eventTypes = data;
      this.starthour = this.eventTypes[0].StartHour;
      this.selectedItemId = this.eventTypes[0].Itid;
      this.selectedName = this.eventTypes[0].Name;
      this.selectedColor = this.eventTypes[0].Color;
      this.events = [];
      this.getBookingDetails();
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
    // Required all events for filter event place and equipments in modal and to show by selected type from dropdown.
    
    let ItemId = this.eventTypes.find((t: { Name: any; }) => t.Name == this.selectedName).Itid;
    // await this.bookinService.GetGNCBookingDetails(ItemId).subscribe((data) => {
    //   this.bookingDetails = data;
    //   if (this.bookingDetails.length > 0) {
    //     this.bookingDetails.forEach((element) => {
    //       let event: CalendarEvent<any> = {
    //         id: element.bdid,
    //         title: element.Person_Name,
    //         start: moment(element.Stime, 'YYYY-MM-DDTHH:mm:ssZ').toDate(),
    //         end: moment(element.Etime, 'YYYY-MM-DDTHH:mm:ssZ').toDate(),
    //         color: Constants.getColorbyName(this.selectedColor),
    //         meta: {
    //           itemId: element.Itid,
    //           tatkalBookingType: element.btype,
    //           setUp: element.setup,
    //           eventPlace: element.eplace,
    //           otherPlace: element.oplace,
    //           equipments: element.equpiment,
    //           laptop: element.lpt,
    //           otherRequirements: element.otherreq,
    //           remarks: element.remarks,
    //         },
    //       }
    //       this.events.push(event);
    //     });
    //   }
    //   else {
    //     this.events = [];
    //   }
    //   this.cd.detectChanges();
    //   this.refresh.next();
    // });
    
    // this.events = [
    //   {
    //     id: 1,
    //     title: 'Title 1',
    //     start: new Date(),
    //     end: addHours(new Date(), 4),
    //     color: Constants.colors['red'],
    //     meta: 
    //     {
    //       itemId: 19,
    //       tatkalBookingType: 'Mht Booking',
    //       setUp: 'Fixed Setup',
    //       eventPlace: 'GNC Basement',
    //       otherPlace: '',
    //       equipments: [],
    //       laptop: true,
    //       otherRequirements: 'otherRequirements',
    //       remarks: '',
    //     },
    //   },
    //   {
    //     id: 2,
    //     title: 'Title 2',
    //     start: addHours(new Date(), 1),
    //     end: addHours(new Date(), 8),
    //     color: Constants.colors['yellow'],
    //     meta: 
    //     {
    //       itemId: 20,
    //       tatkalBookingType: 'Mht Booking',
    //       setUp: 'Fixed Setup',
    //       eventPlace: 'Dadanagar Hall',
    //       otherPlace: '',
    //       equipments: [],
    //       laptop: true,
    //       otherRequirements: 'otherRequirements',
    //       remarks: '',
    //     },
    //   },
    //   {
    //     id: 3,
    //     title: 'Title 3',
    //     start: addHours(new Date(), 1),
    //     end: addDays(new Date(), 2),
    //     color: Constants.colors['blue'],
    //     meta: 
    //     {
    //       itemId: 21,
    //       tatkalBookingType: 'Mht Booking',
    //       setUp: 'Portabl Setup',
    //       eventPlace: 'Sector 1 club house',
    //       otherPlace: '',
    //       equipments: ['Laptop & Projector (Dell(2) + Dell(2) + LONG HDMI Cable - 1 (3 MTR)',
    //                   'Pignos 3 - with AA batteries',
    //                   'Crabtree',
    //                   'Extension Board no -1', 'Other'],
    //       laptop: null,
    //       otherRequirements: 'otherRequirements',
    //       remarks: '',
    //     },
    //   },
    //   {
    //     id: 4,
    //     title: 'Title 4',
    //     start: addHours(new Date(), 1),
    //     end: addDays(new Date(), 1),
    //     color: Constants.colors['green'],
    //     meta: 
    //     {
    //       itemId: 22,
    //       tatkalBookingType: 'Mht Booking',
    //       setUp: 'Portabl Setup',
    //       eventPlace: 'Other',
    //       otherPlace: 'otherPlace',
    //       equipments: ["Cordless receiver System 1"],
    //       laptop: null,
    //       otherRequirements: '',
    //       remarks: '',
    //     },
    //   },
    //   {
    //     id: 5,
    //     title: 'Title 5',
    //     start: addHours(new Date(), 1),
    //     end: addDays(new Date(), 1),
    //     color: Constants.colors['pink'],
    //     meta: 
    //     {
    //       itemId: 23,
    //       tatkalBookingType: 'Mht Booking',
    //       setUp: 'Fixed Setup',
    //       eventPlace: 'Sector 4 Community Hall',
    //       otherPlace: '',
    //       equipments: [],
    //       laptop: true,
    //       otherRequirements: 'otherRequirements',
    //       remarks: '',
    //     },
    //   },
    //   {
    //     id: 6,
    //     title: 'Title 6',
    //     start: addHours(new Date(), -2),
    //     end: addHours(new Date(), -1),
    //     color: Constants.colors['red'],
    //     meta: 
    //     {
    //       itemId: 19,
    //       tatkalBookingType: 'Mht Booking',
    //       setUp: 'Fixed Setup',
    //       eventPlace: 'GNC Basement',
    //       otherPlace: '',
    //       equipments: [],
    //       laptop: true,
    //       otherRequirements: 'otherRequirements',
    //       remarks: '',
    //     },
    //   },
    //   {
    //     id: 7,
    //     title: 'Title 7',
    //     start: addHours(new Date(), 2),
    //     end: addHours(new Date(), 3),
    //     color: Constants.colors['orange'],
    //     meta: 
    //     {
    //       itemId: 24,
    //       tatkalBookingType: 'Only Laptop',
    //       setUp: '',
    //       eventPlace: '',
    //       otherPlace: '',
    //       equipments: [],
    //       laptop: null,
    //       otherRequirements: '',
    //       remarks: '',
    //     },
    //   },
    // ]

    // this.eventsByItemId = this.events.filter(e => e.meta.itemId == ItemId);
  }

  setView(view: any) {
    this.view = view;
  }

  dayClicked({ date }: { date: Date }): void {
    console.log(date);
    this.viewDate = date;
    this.view = CalendarView.Day;
  }

  eventClicked({ event }: { event: CalendarEvent<any> }): void {
    const getdate = moment(event.end, 'YYYY-MM-DDTHH:mm:ssZ').toDate();
    const curdate = moment().toDate();
    if (getdate >= curdate)
      this.openEventModal(event, 'edit');
    else
      this.openEventModal(event, 'view');
  }

  hourSegmentClicked(date: Date) {
    let newEvent: CalendarEvent<any> = {
      id: undefined,
      title: '',
      start: startOfMinute(date),
      end: addMinutes(startOfMinute(date), 30),
      color: Constants.getColorbyName(this.selectedColor),
      meta: {
        itemId: this.selectedItemId,
        tatkalBookingType: null,
        setUp: '',
        eventPlace: '',
        otherPlace: '',
        equipments: [],
        laptop: null,
        otherRequirements: '',
        remarks: '',
      },
    }

    const getdate = moment(newEvent.start, 'YYYY-MM-DDTHH:mm:ssZ').toDate();
    const curdate = moment().toDate();
    
    if (getdate >= curdate)
      this.openEventModal(newEvent, 'add');
    else
      alert('Past times can not be added or edited.');
  };

  openEventModal(event: CalendarEvent<any>, action: string) {
    let deepCopyEvent = Cloneable.deepCopy(event);
    const modalRef = this.modalService.open(GncEventModalComponent,  { backdrop: 'static', keyboard: false });
    modalRef.componentInstance.event = deepCopyEvent;
    modalRef.componentInstance.selectedType = this.selectedType;
    modalRef.componentInstance.selectedName = this.selectedName;
    modalRef.componentInstance.selectedColor = this.selectedColor;
    modalRef.componentInstance.eventList = this.events;
    modalRef.componentInstance.action = action;
    modalRef.componentInstance.startHour = this.starthour;
    modalRef.result.then((result) => {
      if (result == 'delete') {
        this.eventsByItemId = this.eventsByItemId.filter((e) => e !== event);
        this.events = this.events.filter((e) => e !== event);
        if(event.id){
          this.bookinService.DeleteGNCBookingDetails(
            event.id)
            .subscribe((data) => {
            });
        }
        this.refresh.next();
      }
      else if(result == 'duplicate'){
        let duplicateEvent = Cloneable.deepCopy(event);
        duplicateEvent.id = undefined;
        this.openEventModal(duplicateEvent, 'add');
      }
      else if (result && action == 'add') {
        result.id = this.events.length + 1;
        this.eventsByItemId = [
          ...this.eventsByItemId,
          result,
        ];
        this.events = [
          ...this.events,
          result,
        ];

        let stime = moment(result.start).format('YYYY-MM-DD HH:mm:ss');
        let etime = moment(result.end).format('YYYY-MM-DD HH:mm:ss');
        this.bookinService.InsertGNCBookingDetails(
          result.title,
          stime,
          etime,
          result.meta.itemId,
          result.meta)
          .subscribe((data) => {
          });
        this.refresh.next();
      }
      else if (result && action == 'edit') {
        event.title = result.title;
        event.start = result.start;
        event.end = result.end;
        event.meta = result.meta;
        this.refresh.next();
        let stime = moment(result.start).format('YYYY-MM-DD HH:mm:ss');
        let etime = moment(result.end).format('YYYY-MM-DD HH:mm:ss');
        this.bookinService.UpdateGNCBookingDetails(
          result.title,
          stime,
          etime,
          result.meta.itemId,
          result.id,
          result.meta)
          .subscribe((data) => {
          });
        this.refresh.next();
      }
    },
      (reason) => {
      });
  }

  public exportData() {
    let fileName = "BookingDetails_" + this.selectedType;
    let exportDataList: any[] = [];
    let i = 1;
    this.events.forEach(element => {
      let department = this.getDepartmentbyItemID(element.meta.itemId);
      let data = ``;
      element.meta.equipments.forEach((e: string) => {
        data = `${data}\n${e}`;
      });
      let event = {
        'Sr No': i,
        'Type': element.meta.tatkalBookingType,
        'Department': department,
        'Person Name': element.title,
        'Pick up Date': moment(element.start).format('DD-MM-YYYY hh:mm A'),
        'Return Date': moment(element.end).format('DD-MM-YYYY hh:mm A'),
        'Set up' : element.meta.setUp,
        'Event Place' : element.meta.eventPlace,
        'Laptop' : element.meta.laptop,
        'Equipments' : data,
        'Other Requirements' : element.meta.otherRequirements,
        'Remarks' : element.meta.remarks,
      }
      exportDataList.push(event);
      i++;
    });
    this.excelExportService.exportData(exportDataList, new IgxExcelExporterOptions(fileName));
  }

  getFormatDateString(date: Date | undefined){
    if(date)
      return formatDate(date, 'dd-MM-yyyy hh:mm a', this.locale);
    return '';
  }

  getDepartmentbyItemID(itemId: number){
    return this.eventTypes.find((t: { Itid: number; }) => t.Itid == itemId).Name;
  }

  ngOnDestroy() {
    this.destroy$.next();
  }
}
