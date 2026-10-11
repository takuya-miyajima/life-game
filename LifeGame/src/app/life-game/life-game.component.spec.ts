import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { LifeGameComponent } from './life-game.component';

describe('LifeGameComponent', () => {
  let component: LifeGameComponent;
  let fixture: ComponentFixture<LifeGameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [LifeGameComponent] }).compileComponents();
    fixture = TestBed.createComponent(LifeGameComponent);
    component = fixture.componentInstance;
    component.size = { width: 10, height: 10 };
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  function livePositions(): string[] {
    return component.cells.flat().filter(cell => cell.alived)
      .map(cell => `${cell.position.x},${cell.position.y}`);
  }

  it('creates bounded neighbours without wrapping at edges', () => {
    expect(component.cells[0][0].neighbors.length).toBe(3);
    expect(component.cells[0][1].neighbors.length).toBe(5);
    expect(component.cells[1][1].neighbors.length).toBe(8);
  });

  it('evolves a blinker and renders both generations', () => {
    for (const x of [2, 3, 4]) {
      component.cells[3][x].alived = true;
    }
    component.tick();
    fixture.detectChanges();
    expect(livePositions()).toEqual(['3,2', '3,3', '3,4']);
    expect(fixture.nativeElement.querySelectorAll('.cell.on').length).toBe(3);
    component.tick();
    expect(livePositions()).toEqual(['2,3', '3,3', '4,3']);
  });

  it('preserves a block and removes an isolated cell', () => {
    for (const [x, y] of [[2, 2], [2, 3], [3, 2], [3, 3], [8, 8]]) {
      component.cells[y][x].alived = true;
    }
    component.tick();
    expect(livePositions()).toEqual(['2,2', '3,2', '2,3', '3,3']);
  });

  it('clears both visible and subsequent generations', () => {
    for (const x of [2, 3, 4]) {
      component.cells[3][x].alived = true;
    }
    component.tick();
    component.clear();
    component.tick();
    expect(livePositions()).toEqual([]);
  });

  it('randomizes cells and allows cell toggling', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.25);
    component.random();
    expect(livePositions().length).toBe(100);
    component.toggleCell(component.cells[0][0]);
    expect(component.cells[0][0].alived).toBe(false);
  });

  it('rejects invalid settings and accepts valid settings', () => {
    component.periodControl.setValue(99);
    component.applyPeriod();
    expect(component.period).toBe(100);
    component.periodControl.setValue(200);
    component.applyPeriod();
    expect(component.period).toBe(200);

    component.widthControl.setValue(10.5);
    component.applySize();
    expect(component.size).toEqual({ width: 10, height: 10 });
    component.widthControl.setValue(12);
    component.heightControl.setValue(11);
    component.applySize();
    expect(component.cells.length).toBe(11);
    expect(component.cells[0].length).toBe(12);
    expect(livePositions()).toEqual([]);
  });

  it('runs only one timer, changes its period, and stops on destroy', () => {
    vi.useFakeTimers();
    const tick = vi.spyOn(component, 'tick');
    component.start();
    component.start();
    vi.advanceTimersByTime(200);
    expect(tick).toHaveBeenCalledTimes(2);

    component.periodControl.setValue(300);
    component.applyPeriod();
    vi.advanceTimersByTime(299);
    expect(tick).toHaveBeenCalledTimes(2);
    vi.advanceTimersByTime(1);
    expect(tick).toHaveBeenCalledTimes(3);

    const subscription = component.timerObj;
    component.ngOnDestroy();
    expect(subscription?.closed).toBe(true);
    expect(component.timerObj).toBeNull();
    vi.advanceTimersByTime(600);
    expect(tick).toHaveBeenCalledTimes(3);
  });

  it('stops a running game when resizing', () => {
    vi.useFakeTimers();
    component.start();
    const subscription = component.timerObj;
    component.widthControl.setValue(12);
    component.heightControl.setValue(10);
    component.applySize();
    expect(subscription?.closed).toBe(true);
    expect(component.timerObj).toBeNull();
  });
});
