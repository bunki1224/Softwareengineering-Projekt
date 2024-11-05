class Trip {
  private id: string;
  private destination: string;
  private startDate: Date;
  private endDate: Date;
  private timeline: Timeline;

  constructor(id: string, destination: string, startDate: Date, endDate: Date) {
    this.id = id;
    this.destination = destination;
    this.startDate = startDate;
    this.endDate = endDate;
    this.timeline = new Timeline();
  }

  addEvent(event: Event): void {
    this.timeline.addEvent(event);
  }

  getEvents(): Event[] {
    return this.timeline.getEvents();
  }
}
