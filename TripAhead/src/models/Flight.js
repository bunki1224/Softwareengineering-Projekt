class FlightEvent extends Event {
  private flightNumber: string;
  private departureLocation: string;
  private arrivalLocation: string;

  constructor(id: string, startTime: Date, endTime: Date, flightNumber: string, departureLocation: string, arrivalLocation: string) {
    super(id, startTime, endTime);
    this.flightNumber = flightNumber;
    this.departureLocation = departureLocation;
    this.arrivalLocation = arrivalLocation;
  }

  getDetails(): string {
    return `Flight ${this.flightNumber} from ${this.departureLocation} to ${this.arrivalLocation}`;
  }
}
