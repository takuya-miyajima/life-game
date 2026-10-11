import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  it('renders the game and its controls', async () => {
    await TestBed.configureTestingModule({ imports: [AppComponent] }).compileComponents();
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance.title).toBe('LifeGame');
    expect(fixture.nativeElement.querySelector('app-life-game')).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('Life Game');
    expect(fixture.nativeElement.querySelectorAll('.cell').length).toBe(10000);
  });
});
