import { CalendarEvent } from "angular-calendar";
import * as moment from "moment";

export class EventData
{
    public bdid:number | string;
    public name:string;
    public stime:string;
    public etime:string;
    public itemid:string;
    public btype:string;
    public setup:string;
    public eplace:string;
    public oplace:string;
    public equpiment:string
    public otherreq:string;
    public purpose:string;
    public otherpurpose:string;

    constructor(event: CalendarEvent<any>){
        this.bdid = event.id;
        this.name = event.title;
        this.stime = moment(event.start).format('YYYY-MM-DD HH:mm:ss');
        this.etime = moment(event.end).format('YYYY-MM-DD HH:mm:ss');
        this.itemid = event.meta.itemId;
        this.btype = event.meta.bookingType;
        this.setup = event.meta.setUp;
        this.eplace = event.meta.eventPlace;
        this.oplace = event.meta.otherPlace;
        this.equpiment = event.meta.equipments.toString();
        this.otherreq = event.meta.otherRequirements;
        this.purpose = event.meta.purpose;
        this.otherpurpose = event.meta.otherPurpose;
    }
}