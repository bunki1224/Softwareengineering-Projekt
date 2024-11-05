abstract class Event {
  protected id: string;
  protected startTime: Date;
  protected endTime: Date;

  constructor(id: string, startTime: Date, endTime: Date) {
    this.id = id;
    this.startTime = startTime;
    this.endTime = endTime;
  }

  abstract getDetails(): string;

  getStartTime(): Date {
    return this.startTime;
  }
}