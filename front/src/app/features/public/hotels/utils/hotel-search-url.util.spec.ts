import { convertToParamMap } from '@angular/router';
import { createEmptyFilters } from '../models/hotel-filter.model';
import { HotelSearchQuery } from '../models/hotel-search-query.model';
import {
  paramMapToParams,
  parseFilters,
  parsePage,
  parseSearchQuery,
  parseSort,
  toQueryParams,
} from './hotel-search-url.util';

describe('hotel-search-url.util', () => {
  describe('parseSearchQuery', () => {
    it('reads destination/dates/travellers from params', () => {
      const params = paramMapToParams(
        convertToParamMap({
          destination: 'Istanbul',
          checkIn: '2026-10-12',
          checkOut: '2026-10-18',
          adults: '2',
          children: '1',
          rooms: '1',
        }),
      );

      expect(parseSearchQuery(params)).toEqual({
        destination: 'Istanbul',
        checkIn: '2026-10-12',
        checkOut: '2026-10-18',
        adults: 2,
        children: 1,
        rooms: 1,
      });
    });

    it('falls back to sane defaults when params are absent', () => {
      const query = parseSearchQuery(paramMapToParams(convertToParamMap({})));
      expect(query.destination).toBe('');
      expect(query.adults).toBe(2);
      expect(query.children).toBe(0);
      expect(query.rooms).toBe(1);
      expect(query.checkIn < query.checkOut).toBe(true);
    });

    it('ignores an invalid non-numeric adults param rather than throwing', () => {
      const params = paramMapToParams(convertToParamMap({ adults: 'not-a-number' }));
      expect(parseSearchQuery(params).adults).toBe(2);
    });
  });

  describe('parseFilters', () => {
    it('parses list and boolean params', () => {
      const params = paramMapToParams(
        convertToParamMap({
          stars: '4,5',
          rating: '8',
          board: 'BREAKFAST,ALL_INCLUSIVE',
          freeCancellation: 'true',
          amenities: 'wifi,pool',
          area: 'Taksim',
        }),
      );

      const filters = parseFilters(params);
      expect(filters.stars).toEqual([4, 5]);
      expect(filters.minGuestRating).toBe(8);
      expect(filters.boardTypes).toEqual(['BREAKFAST', 'ALL_INCLUSIVE']);
      expect(filters.freeCancellationOnly).toBe(true);
      expect(filters.amenities).toEqual(['wifi', 'pool']);
      expect(filters.areas).toEqual(['Taksim']);
    });

    it('drops unknown board/amenity values instead of passing them through', () => {
      const params = paramMapToParams(
        convertToParamMap({ board: 'BREAKFAST,NOT_REAL', amenities: 'wifi,not-real' }),
      );
      const filters = parseFilters(params);
      expect(filters.boardTypes).toEqual(['BREAKFAST']);
      expect(filters.amenities).toEqual(['wifi']);
    });

    it('returns the empty filter set when no params are present', () => {
      expect(parseFilters(paramMapToParams(convertToParamMap({})))).toEqual(createEmptyFilters());
    });
  });

  describe('parseSort / parsePage', () => {
    it('defaults to RECOMMENDED and page 1', () => {
      const params = paramMapToParams(convertToParamMap({}));
      expect(parseSort(params)).toBe('RECOMMENDED');
      expect(parsePage(params)).toBe(1);
    });

    it('rejects an unknown sort key and falls back to the default', () => {
      const params = paramMapToParams(convertToParamMap({ sort: 'NOT_A_SORT' }));
      expect(parseSort(params)).toBe('RECOMMENDED');
    });

    it('reads a valid sort key and page number', () => {
      const params = paramMapToParams(convertToParamMap({ sort: 'PRICE_LOW', page: '3' }));
      expect(parseSort(params)).toBe('PRICE_LOW');
      expect(parsePage(params)).toBe(3);
    });
  });

  describe('toQueryParams / parse round-trip', () => {
    const query: HotelSearchQuery = {
      destination: 'Istanbul',
      checkIn: '2026-10-12',
      checkOut: '2026-10-18',
      adults: 2,
      children: 1,
      rooms: 1,
    };

    it('omits default values to keep the URL short', () => {
      const params = toQueryParams(query, createEmptyFilters(), 'RECOMMENDED', 1);
      expect(params['sort']).toBeUndefined();
      expect(params['page']).toBeUndefined();
      expect(params['adults']).toBeUndefined(); // 2 is the default
      expect(params['children']).toBe(1); // 0 is the default, 1 is not
      expect(params['destination']).toBe('Istanbul');
    });

    it('round-trips query + filters + sort + page through parse(toQueryParams(...))', () => {
      const filters = { ...createEmptyFilters(), stars: [4, 5], freeCancellationOnly: true };
      const params = toQueryParams(query, filters, 'GUEST_RATING', 2);
      const paramMap = paramMapToParams(convertToParamMap(params));

      expect(parseSearchQuery(paramMap)).toEqual(query);
      expect(parseFilters(paramMap)).toEqual(filters);
      expect(parseSort(paramMap)).toBe('GUEST_RATING');
      expect(parsePage(paramMap)).toBe(2);
    });
  });
});
