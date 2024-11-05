class Timeline {
  private events: Event[];

  constructor() {
    this.events = [];
  }

  addEvent(event: Event): void {
    this.events.push(event);
    this.events.sort((a, b) => a.getStartTime().getTime() - b.getStartTime().getTime());
  }

  getEvents(): Event[] {
    return this.events;
  }
}