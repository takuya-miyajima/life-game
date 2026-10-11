import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { interval, Subscription } from 'rxjs';
import { Cell } from '../entity/cell';
import { MaterialModule } from '../modules/material/material.module';
import { CustomValidator } from '../validator/custom-validator';

const NEIGHBOURS = [
  { x: -1, y: -1 }, { x: -1, y: 0 }, { x: -1, y: 1 },
  { x: 0, y: -1 }, { x: 0, y: 1 },
  { x: 1, y: -1 }, { x: 1, y: 0 }, { x: 1, y: 1 }
];

@Component({
  selector: 'app-life-game',
  imports: [ReactiveFormsModule, MaterialModule],
  templateUrl: './life-game.component.html',
  styleUrls: ['./life-game.component.scss']
})
export class LifeGameComponent implements OnInit, OnDestroy {
  private readonly changeDetector = inject(ChangeDetectorRef);

  cells: Cell[][] = [];
  // Two buffers allow every cell to use the same generation of neighbours.
  calcCells: Record<number, Cell[][]> = {};
  cellsIndex = 1;
  size = { width: 100, height: 100 };
  period = 100;

  readonly periodControl = new FormControl(this.period, {
    nonNullable: true, validators: [CustomValidator.period]
  });
  readonly widthControl = new FormControl(this.size.width, {
    nonNullable: true, validators: [CustomValidator.size]
  });
  readonly heightControl = new FormControl(this.size.height, {
    nonNullable: true, validators: [CustomValidator.size]
  });

  timerObj: Subscription | null = null;

  ngOnInit(): void {
    this.resetCells();
  }

  ngOnDestroy(): void {
    this.stop();
  }

  getPeriodMessage(): string {
    return CustomValidator.getPeriodMessage();
  }

  getSizeMessage(): string {
    return CustomValidator.getSizeMessage();
  }

  private resetCells(): void {
    this.calcCells = { [-1]: this.newCells(), [1]: this.newCells() };
    this.cellsIndex = 1;
    this.cells = this.calcCells[this.cellsIndex];
  }

  newCells(): Cell[][] {
    const cells: Cell[][] = [];
    for (let row = 0; row < this.size.height; row++) {
      const cellRow: Cell[] = [];
      for (let col = 0; col < this.size.width; col++) {
        cellRow.push(new Cell(col, row, false));
      }
      cells.push(cellRow);
    }

    for (let row = 0; row < this.size.height; row++) {
      for (let col = 0; col < this.size.width; col++) {
        for (const diff of NEIGHBOURS) {
          const y = row + diff.y;
          const x = col + diff.x;
          if (y >= 0 && y < this.size.height && x >= 0 && x < this.size.width) {
            cells[row][col].neighbors.push(cells[y][x]);
          }
        }
      }
    }
    return cells;
  }

  toggleCell(cell: Cell): void {
    cell.alived = !cell.alived;
  }

  tick(): void {
    const currentCells = this.calcCells[this.cellsIndex];
    this.cellsIndex *= -1;
    const nextCells = this.calcCells[this.cellsIndex];
    for (let row = 0; row < this.size.height; row++) {
      for (let col = 0; col < this.size.width; col++) {
        nextCells[row][col].alived = this.aliveInNextTick(currentCells[row][col]);
      }
    }
    this.cells = nextCells;
    // RxJS timers must explicitly notify Angular's zoneless change detection.
    this.changeDetector.markForCheck();
  }

  aliveInNextTick(cell: Cell): boolean {
    const aliveAmount = cell.neighbors.filter(neighbor => neighbor.alived).length;
    return aliveAmount === 3 || (cell.alived && aliveAmount === 2);
  }

  start(): void {
    if (!this.timerObj) {
      this.timerObj = interval(this.period).subscribe(() => this.tick());
    }
  }

  stop(): void {
    this.timerObj?.unsubscribe();
    this.timerObj = null;
  }

  clear(): void {
    for (const row of this.cells) {
      for (const cell of row) {
        cell.alived = false;
      }
    }
  }

  random(): void {
    for (const row of this.cells) {
      for (const cell of row) {
        cell.alived = Math.random() < 0.5;
      }
    }
  }

  applyPeriod(): void {
    if (this.periodControl.invalid) {
      this.periodControl.markAsTouched();
      return;
    }
    this.period = this.periodControl.value;
    if (this.timerObj) {
      this.stop();
      this.start();
    }
  }

  applySize(): void {
    if (this.widthControl.invalid || this.heightControl.invalid) {
      this.widthControl.markAsTouched();
      this.heightControl.markAsTouched();
      return;
    }
    this.size = { width: this.widthControl.value, height: this.heightControl.value };
    this.stop();
    this.resetCells();
  }
}
