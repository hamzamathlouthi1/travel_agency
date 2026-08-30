import { Injectable, computed, signal } from '@angular/core';
import { SearchMode } from '../models/search-mode';
import { HotelSearchState, Room, createHotelSearchState, createRoom } from '../models/hotel-search';
import { VoyageSearchState, createVoyageSearchState } from '../models/voyage-search';
import { CircuitSearchState, createCircuitSearchState } from '../models/circuit-search';

// Local UI state for the travel search feature — one signal store shared by
// every mode's field components. Deliberately not NgRx: this is
// presentation-layer state for a single feature, not cross-app state.
@Injectable()
export class SearchStateService {
  private readonly modeSignal = signal<SearchMode>('HOTELS');
  private readonly hotelSignal = signal<HotelSearchState>(createHotelSearchState());
  private readonly voyageSignal = signal<VoyageSearchState>(createVoyageSearchState());
  private readonly circuitSignal = signal<CircuitSearchState>(createCircuitSearchState());

  readonly mode = this.modeSignal.asReadonly();
  readonly hotel = this.hotelSignal.asReadonly();
  readonly voyage = this.voyageSignal.asReadonly();
  readonly circuit = this.circuitSignal.asReadonly();

  readonly isHotelSearchValid = computed(
    () => !!this.hotelSignal().destination && !!this.hotelSignal().checkIn && !!this.hotelSignal().checkOut,
  );
  readonly isVoyageSearchValid = computed(() => !!this.voyageSignal().destination);
  readonly isCircuitSearchValid = computed(() => !!this.circuitSignal().region);

  setMode(mode: SearchMode): void {
    this.modeSignal.set(mode);
  }

  setHotelDestination(destination: string): void {
    this.hotelSignal.update((state) => ({ ...state, destination }));
  }

  setHotelDates(checkIn: string | null, checkOut: string | null): void {
    this.hotelSignal.update((state) => ({ ...state, checkIn, checkOut }));
  }

  setRooms(rooms: readonly Room[]): void {
    this.hotelSignal.update((state) => ({ ...state, rooms }));
  }

  addRoom(): void {
    this.hotelSignal.update((state) => ({ ...state, rooms: [...state.rooms, createRoom()] }));
  }

  removeRoom(index: number): void {
    this.hotelSignal.update((state) => ({
      ...state,
      rooms: state.rooms.length > 1 ? state.rooms.filter((_, i) => i !== index) : state.rooms,
    }));
  }

  updateRoom(index: number, patch: Partial<Room>): void {
    this.hotelSignal.update((state) => ({
      ...state,
      rooms: state.rooms.map((room, i) => (i === index ? { ...room, ...patch } : room)),
    }));
  }

  patchVoyage(patch: Partial<VoyageSearchState>): void {
    this.voyageSignal.update((state) => ({ ...state, ...patch }));
  }

  patchCircuit(patch: Partial<CircuitSearchState>): void {
    this.circuitSignal.update((state) => ({ ...state, ...patch }));
  }
}
