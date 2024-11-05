class ActivityEvent extends Event {
  private description: string;

  constructor(id: string, startTime: Date, endTime: Date, description: string) {
    super(id, startTime, endTime);
    this.description = description;
  }

  getDetails(): string {
    return `Activity: ${this.description}`;
  }
}
