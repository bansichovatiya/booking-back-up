import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CalendarEvent } from 'angular-calendar';
import { BookingService } from '../provider/booking.service';
import * as moment from 'moment';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css']
})
export class ModalComponent implements OnInit {
  @Input() public event: CalendarEvent<{ type: string }>;
  public startTime: string;
  public endTime: string;
  @Input() selectedEvent;
  @Input() selectedColor;
  @Input() eventList;
  @Input() action;
  @Input() startHour;
  validationmsg: any;

  constructor(public activeModal: NgbActiveModal) { }

  ngOnInit(): void {
    this.startTime = (this.event.start.getHours().toString().length == 1 ? '0' + this.event.start.getHours() : this.event.start.getHours())
      + ':' + (this.event.start.getMinutes().toString().length == 1 ? '0' + this.event.start.getMinutes() : this.event.start.getMinutes());
    this.endTime = (this.event.end.getHours().toString().length == 1 ? '0' + this.event.end.getHours() : this.event.end.getHours())
      + ':' + (this.event.end.getMinutes().toString().length == 1 ? '0' + this.event.end.getMinutes() : this.event.end.getMinutes());
  }

  passBack(action: string) {
    switch (action) {
      case 'save':
        let newStartTime = this.startTime.split(':');
        let newEndTime = this.endTime.split(':');
        this.event.start.setHours(Number(newStartTime[0]), Number(newStartTime[1]), 0);
        this.event.end.setHours(Number(newEndTime[0]), Number(newEndTime[1]), 0)
        if (!this.event.title) {
          this.showError('Name is missing.');
        }
        else if (this.event.start && this.event.end) {
          let compstarttime = moment(this.event.start, 'YYYY-MM-DDTHH:mm:ssZ').toDate();
          let compendtime = moment(this.event.end, 'YYYY-MM-DDTHH:mm:ssZ').toDate();
          let sthrime = moment(this.convertTimeToDateTime('0' + (this.startHour - 1) + ':59'), 'YYYY-MM-DDTHH:mm:ssZ').toDate();
          let curtime = moment().toDate();
          if (compstarttime <= sthrime) {
            this.showError('Start time should be within time range.');
          }
          else if (compstarttime >= compendtime) {
            // if (compstarttime >= compendtime) {
              this.showError('Start time is greater than end time or both are same.');
          }
          else if (compstarttime <= curtime) {
            this.showError('Past times are not allowed');
          }
          else {
            const eventid = this.event.id;
            const overlappingEvent = this.eventList.find((otherEvent) => {
              return (
                otherEvent !== this.event && otherEvent.id != eventid &&
                ((otherEvent.start < this.event.start && this.event.start < otherEvent.end) ||
                  (otherEvent.start < this.event.end && this.event.start < otherEvent.end)));
            });
            if (overlappingEvent)
            this.showError('Overlapping times entered.');
            else {
              this.activeModal.close(this.event);
              this.validationmsg = '';
            }
          }
        }
        else {
          this.activeModal.close(this.event);
          this.validationmsg = '';
        }
        break;

      case 'delete':
        this.activeModal.close('delete');
        break;
    }
  }

  convertTimeToDateTime(timeString) {
    var now = moment(this.event.start, 'YYYY-MM-DDTHH:mm:ssZ').toDate();
    var year = now.getFullYear();
    var month = ('0' + (now.getMonth() + 1)).slice(-2);
    var day = ('0' + now.getDate()).slice(-2);
    var dateTimeString = year + '-' + month + '-' + day + 'T' + timeString + ':00';
    return dateTimeString;
  }

  showError(message: string) {
    this.validationmsg = message;
    let self = this;
    setTimeout(function(){
      self.validationmsg = '';
    }, 5000);
  }
}

