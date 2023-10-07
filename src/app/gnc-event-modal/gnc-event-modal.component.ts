import { Component, OnInit, Input, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CalendarEvent } from 'angular-calendar';
import * as moment from 'moment';
import * as data from '../../assets/json/data.json';
import { isSameDay } from 'date-fns';

@Component({
  selector: 'app-gnc-event-modal',
  templateUrl: './gnc-event-modal.component.html',
  styleUrls: ['./gnc-event-modal.component.css'],
  encapsulation: ViewEncapsulation.None
})

export class GncEventModalComponent implements OnInit {
  @Input() public event!: CalendarEvent<any>;
  @Input() selectedItemId: any;
  @Input() eventList!: any[];
  @Input() action: any;
  @Input()startHour!: number;
  public startTime!: string;
  public endTime!: string;
  validationmsg: any;
  bookingTypeList: string[] = ["Only Laptop", "GNC Basement Hall", "Activity Booking"];
  gncSetUpList: string[] = ["Fixed Setup", "Portable Setup"];
  jsonData: any = (data as any).default;
  eventPlaces: string[] = [];
  equipments: string[] = [];
  purposeList: string[] = [];
  equipmentsDropdownSettings = {
    singleSelection: false,
    allowSearchFilter: true
  };
  onlyLaptopEquipmentsDropdownSettings = {
    singleSelection: false,
    allowSearchFilter: true,
    enableCheckAll: false,
  };

  constructor(
    public activeModal: NgbActiveModal,
    private modalService: NgbModal,
    private cd: ChangeDetectorRef,) { }

  ngOnInit(): void {
    this.startTime = (this.event.start.getHours().toString().length == 1 ? '0' + this.event.start.getHours() : this.event.start.getHours())
      + ':' + (this.event.start.getMinutes().toString().length == 1 ? '0' + this.event.start.getMinutes() : this.event.start.getMinutes());
    if (this.event.end) {
      this.endTime = (this.event.end.getHours().toString().length == 1 ? '0' + this.event.end.getHours() : this.event.end.getHours())
        + ':' + (this.event.end.getMinutes().toString().length == 1 ? '0' + this.event.end.getMinutes() : this.event.end.getMinutes());
    }

    if (this.event.meta.bookingType) {
      this.filterPlaceAndEquimpents();
      if(this.event.meta.bookingType == this.bookingTypeList[2]){
        this.purposeList = this.jsonData[this.event.meta.bookingType]["Purpose"];
      }
    }
  }

  passBack(action: string) {
    switch (action) {
      case 'save':
        if (this.validateEvent()) {
          // When all details is perfect.
          if (this.event.meta.bookingType == "Activity Booking") {
            if (this.event.meta.eventPlace != "Other")
              this.event.meta.otherPlace = null;
            if (this.event.meta.setUp == this.gncSetUpList[1] && !this.event.meta.equipments.includes("Other"))
              this.event.meta.otherRequirements = null;
          }
          this.activeModal.close(this.event);
        }
        break;

      case 'duplicate':
        this.activeModal.close('duplicate');
        break;

      case 'delete':
        this.activeModal.close('delete');
        break;
    }
  }

  validateEvent() {
    let startTag = this.event.meta.bookingType == this.bookingTypeList[1] ? "Start" : 'Pick up';
    let endTag = this.event.meta.bookingType == this.bookingTypeList[1] ? "End" : 'Return';
    if (this.endTime) {
      if(this.event.meta.bookingType != this.bookingTypeList[1]){
        let timeString1 = '11:00';
        let timeString2 = '19:00';
        let time1 = new Date('1970-01-01T' + timeString1);
        let time2 = new Date('1970-01-01T' + timeString2);
        let time3 = new Date('1970-01-01T' + this.endTime);
        if (time3 >= time1 && time3 <= time2) {
        }
        else {
          this.showError('Return time should be within 11 AM to 07 PM.');
          return false;
        }
      }
    }
    else {
      let value = this.event.meta.bookingType == this.bookingTypeList[1] ? "End" : 'Return';
      this.showError( value + ' time is missing');
      return false;
    }

    // For GNC Basement Hall start and end date will same.
    if(this.event.meta.bookingType == this.bookingTypeList[1] && !isSameDay(this.event.start, this.event.end)){
      this.event.end ? new Date(this.event.start.getDate()) : this.event.end.setDate(this.event.start.getDate());
    }

    if (this.event.start && this.event.end) {
      let newStartTime = this.startTime.split(':');
      let newEndTime = this.endTime.split(':');
      this.event.start.setHours(Number(newStartTime[0]), Number(newStartTime[1]), 0);
      this.event.end ? this.event.end.setHours(Number(newEndTime[0]), Number(newEndTime[1]), 0) : null;
      let compstarttime = moment(this.event.start, 'YYYY-MM-DDTHH:mm:ssZ').toDate();
      let compendtime = moment(this.event.end, 'YYYY-MM-DDTHH:mm:ssZ').toDate();
      let sthrime = moment(this.convertTimeToDateTime('0' + (this.startHour - 1) + ':59'), 'YYYY-MM-DDTHH:mm:ssZ').toDate();
      let curtime = moment().toDate();
      if (compstarttime <= sthrime) {
        this.showError(`${startTag} time should be within time range.`);
      }
      else if (compstarttime >= compendtime) {
        // if (compstarttime >= compendtime) {
        this.showError(`${startTag} time is greater than ${endTag} time or both are same.`);
      }
      else if (compendtime <= curtime) {
        this.showError('Past times are not allowed');
      }
      else if (!this.event.title) {
        this.showError('Name is missing.');
      }
      else {
        let isValidData = false;
        if (this.event.meta.bookingType == this.bookingTypeList[2]) {
          if (!this.event.meta.setUp) {
            this.showError('Set up is missing.');
          }
          else if (!this.event.meta.eventPlace) {
            this.showError('Event place is missing.');
          }
          else if (this.event.meta.eventPlace.includes('Other') && !this.event.meta.otherPlace) {
            this.showError('Other place is missing.');
          }
          else if (this.event.meta.equipments.length == 0) {
            this.showError('Please select the appropriate option in Equipments.');
          }
          else if (this.event.meta.setUp == this.gncSetUpList[1] && this.event.meta.equipments.includes('Other') && !this.event.meta.otherRequirements) {
            this.showError('Other Requirements is missing or unselect Other option from Equipments.');
          }
          else if (!this.event.meta.purpose) {
            this.showError('Please select the appropriate option in Purpose.');
          }
          
          else {
            isValidData = true;
          }
        }
        else if (this.event.meta.bookingType == this.bookingTypeList[1]) {
          if (!this.event.meta.purpose) {
            this.showError('Purpose is missing.');
          }
          else {
            isValidData = true;
          }
        }
        else if (this.event.meta.bookingType == this.bookingTypeList[0]) {
          if (this.event.meta.equipments.length == 0) {
            this.showError('Please select the appropriate option in Equipments.');
          }
          else {
            isValidData = true;
          }
        }

        if (isValidData) {
          const eventid = this.event.id;
          const overlappingEvents = this.eventList.filter((otherEvent: CalendarEvent<any>) => {
            return (
              otherEvent !== this.event && otherEvent.id != eventid && otherEvent.end && this.event.end &&
              ((otherEvent.start < this.event.start && this.event.start < otherEvent.end) ||
                (otherEvent.start < this.event.end && this.event.start < otherEvent.end)));
          });
          if (overlappingEvents.length > 0) {
            let conflict = false;
            overlappingEvents.forEach(overlappingEvent => {
              let conflictEventPlace = (overlappingEvent.meta.eventPlace == 'Other' && overlappingEvent.meta.otherPlace == this.event.meta.otherPlace) || (overlappingEvent.meta.eventPlace != 'Other' && this.event.meta.eventPlace != null && overlappingEvent.meta.eventPlace == this.event.meta.eventPlace);
              let conflictEquipments = this.event.meta.equipments.length > 0 && overlappingEvent.meta.equipments.some((item: any) => (item != "Other" && this.event.meta.equipments.includes(item)));

              if (conflictEventPlace && conflictEquipments) {
                conflict = true;
                this.showError('Event place and equipments are conflicting with existing booking - ' + overlappingEvent.title);
              }
              else if (conflictEventPlace) {
                conflict = true;
                this.showError('Event place is conflicting with existing booking - ' + overlappingEvent.title);
              }
              else if (conflictEquipments) {
                conflict = true;
                this.showError('Event equipments are conflicting with existing booking - ' + overlappingEvent.title);
              }
            });

            if (!conflict)
              return true;

          }
          else {
            return true;
          }
        }
      }
    }
    else {
      this.showError(`${startTag} and ${endTag} date or time are missing.`);
    }
    return false;
  }

  convertTimeToDateTime(timeString: string) {
    var now = moment(this.event.start, 'YYYY-MM-DDTHH:mm:ssZ').toDate();
    var year = now.getFullYear();
    var month = ('0' + (now.getMonth() + 1)).slice(-2);
    var day = ('0' + now.getDate()).slice(-2);
    var dateTimeString = year + '-' + month + '-' + day + 'T' + timeString + ':00';
    return dateTimeString;
  }

  onSetUpChanged() {
    switch (this.event.meta.setUp) {
      case this.gncSetUpList[0]:
        this.eventPlaces = this.jsonData[this.bookingTypeList[2]][this.gncSetUpList[0]]["EventPlaces"];
        this.event.meta.eventPlace = null;
        this.event.meta.otherRequirements = null;
        this.event.meta.otherPlace = null;
        this.event.meta.equipments = [];
        break;
      case this.gncSetUpList[1]:
        this.eventPlaces = this.jsonData[this.bookingTypeList[2]][this.gncSetUpList[1]]["EventPlaces"];
        this.equipments = this.jsonData[this.bookingTypeList[2]][this.gncSetUpList[1]]["Equipments"];
        this.event.meta.eventPlace = null;
        this.event.meta.otherRequirements = null;
        this.event.meta.otherPlace = null;
        this.event.meta.equipments = [];
        break;
      default:
        this.eventPlaces = [];
        this.equipments = [];
        break;
    }
    this.filterPlaceAndEquimpents();
  }

  onBookingTypeChanged() {
    // When type is not Activity Booking
    if (this.event.meta.bookingType != this.bookingTypeList[2]) {
      this.eventPlaces = this.jsonData[this.event.meta.bookingType]["EventPlaces"];
      this.equipments = this.jsonData[this.event.meta.bookingType]["Equipments"];

      // clear other data
      this.event.meta.setUp = null;
      this.event.meta.eventPlace = null;
      this.event.meta.otherRequirements = null;
      this.event.meta.otherPlace = null;
      this.event.meta.equipments = [];
      this.event.meta.purpose = null;
    }
    else {
      this.purposeList = this.jsonData[this.event.meta.bookingType]["Purpose"];
      this.event.meta.purpose = null;
    }
    this.filterPlaceAndEquimpents();
  }

  filterPlaceAndEquimpents() {
    let newStartTime = this.startTime.split(':');
    if (this.endTime) {
      if(this.event.meta.bookingType != this.bookingTypeList[1]){
        let timeString1 = '11:00';
        let timeString2 = '19:00';
        let time1 = new Date('1970-01-01T' + timeString1);
        let time2 = new Date('1970-01-01T' + timeString2);
        let time3 = new Date('1970-01-01T' + this.endTime);
        if (time3 >= time1 && time3 <= time2) {
        }
        else {
          this.showError('Return time should be within 11 AM to 07 PM.');
        }
      }

      // For GNC Basement Hall start and end date will same.
      if(this.event.meta.bookingType == this.bookingTypeList[1] && !isSameDay(this.event.start, this.event.end)){
        this.event.end = new Date(this.event.start);
      }

      if (this.event.start && this.event.end) {
        let newEndTime = this.endTime.split(':');
        this.event.start.setHours(Number(newStartTime[0]), Number(newStartTime[1]), 0);
        this.event.end.setHours(Number(newEndTime[0]), Number(newEndTime[1]), 0);
        const eventid = this.event.id;
        const overlappingEvents = this.eventList.filter((otherEvent: CalendarEvent<any>) => {
          return (
            otherEvent !== this.event && otherEvent.id != eventid && !otherEvent.allDay && otherEvent.end && this.event.end &&
            ((otherEvent.start < this.event.start && this.event.start < otherEvent.end) ||
              (otherEvent.start < this.event.end && this.event.start < otherEvent.end)));
        });
        if (overlappingEvents.length > 0) {
          if (this.event.meta.setUp) {
            this.eventPlaces = this.jsonData[this.event.meta.bookingType][this.event.meta.setUp]["EventPlaces"];
            this.equipments = this.jsonData[this.event.meta.bookingType][this.event.meta.setUp]["Equipments"];
          }
          else {
            this.eventPlaces = this.jsonData[this.event.meta.bookingType]["EventPlaces"];
            this.equipments = this.jsonData[this.event.meta.bookingType]["Equipments"];
            if (this.eventPlaces) {
              if (this.eventPlaces.length == 1)
                this.event.meta.eventPlace = this.eventPlaces[0];
            }
          }

          overlappingEvents.forEach(overlappingEvent => {
            if (overlappingEvent.meta.eventPlace != 'Other') {
              this.eventPlaces = this.eventPlaces.filter(p => p != overlappingEvent.meta.eventPlace);
            }
            this.equipments = this.equipments.filter(p => overlappingEvent.meta.equipments.every((i: string) => (i == 'Other' || i != p)));
          });
        }
        else if (this.event.meta.setUp) {
          this.eventPlaces = this.jsonData[this.event.meta.bookingType][this.event.meta.setUp]["EventPlaces"];
          this.equipments = this.jsonData[this.event.meta.bookingType][this.event.meta.setUp]["Equipments"];
        }
        else {
          this.eventPlaces = this.jsonData[this.event.meta.bookingType]["EventPlaces"];
          this.equipments = this.jsonData[this.event.meta.bookingType]["Equipments"];
          if (this.eventPlaces) {
            if (this.eventPlaces.length == 1)
              this.event.meta.eventPlace = this.eventPlaces[0];
          }
        }
      }
    }
  }

  clearErrors() {
    this.validationmsg = '';
  }

  parseDate(dateString: string): Date {
    if (dateString) {
      return new Date(dateString);
    }
    return new Date();
  }

  showError(message: string) {
    this.validationmsg = message;
    let self = this;
    setTimeout(function () {
      self.validationmsg = '';
    }, 5000);
  }

  openModel(content: any) {
    const backdropElement = document.querySelector('.modal-with-blur');
    if (backdropElement) {
      backdropElement.classList.add('blur-background');
    }
    this.modalService.open(content, { backdrop: 'static', keyboard: false, centered: true, size: 'sm' }).result.then((result) => {
      if (backdropElement) {
        backdropElement.classList.remove('blur-background');
      }
      if (result)
        this.passBack('delete');
    }, (reason) => {
      if (backdropElement) {
        backdropElement.classList.remove('blur-background');
      }
    });
    this.cd.detectChanges();
  }
}
