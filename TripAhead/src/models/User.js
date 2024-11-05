class User {
  private id: string;
  private name: string;
  private trips: Trip[];

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
    this.trips = [];
  }

  addTrip(trip: Trip): void {
    this.trips.push(trip);
  }

  getTrips(): Trip[] {
    return this.trips;
  }
}
