class HotelEvent extends Event {
  private hotelName: string;
  private roomNumber: string;

  constructor(id: string, startTime: Date, endTime: Date, hotelName: string, roomNumber: string) {
    super(id, startTime, endTime);
    this.hotelName = hotelName;
    this.roomNumber = roomNumber;
  }

  getDetails(): string {
    return `Hotel stay at ${this.hotelName}, Room ${this.roomNumber}`;
  }
}
