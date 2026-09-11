import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  beforeEach(() => {
    window.localStorage.clear();
    TestBed.configureTestingModule({
      providers: [AuthService, provideRouter([])],
    });
  });

  it('restores the logged-in user from storage on startup', () => {
    const user = {
      id: '42',
      email: 'maria@example.com',
      displayName: 'Maria Doe',
      roles: ['CUSTOMER'] as const,
    };

    window.localStorage.setItem('auth.accessToken', 'token-123');
    window.localStorage.setItem('auth.user', JSON.stringify(user));

    const auth = TestBed.inject(AuthService);

    expect(auth.isAuthenticated()).toBe(true);
    expect(auth.currentUser()).toEqual(user);
  });
});
