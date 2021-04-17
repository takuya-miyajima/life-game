import { Component, OnInit } from '@angular/core';
import { Cell } from '../entity/cell';
import { timer, interval, Observable, Subscription } from 'rxjs';

const NEIGHBOURS = [
  { x: -1, y: -1 },
  { x: -1, y: 0 },
  { x: -1, y: 1 },
  { x: 0, y: -1 },
  { x: 0, y: 1 },
  { x: 1, y: -1 },
  { x: 1, y: 0 },
  { x: 1, y: 1 }
];
@Component({
  selector: 'app-life-game',
  templateUrl: './life-game.component.html',
  styleUrls: ['./life-game.component.scss']
})
export class LifeGameComponent implements OnInit {

  cells: Cell[][];
  size = {
    width: 100,
    height: 100
  };
  period = 100;

  timerObj: Subscription;

  constructor() { }

  ngOnInit(): void {
    this.cells = this.newCells();
  }

  /**
   * 盤面初期化
   */
  newCells(): Cell[][] {
    const cells = [];
    for (let rowCount = 0; rowCount < this.size.height; rowCount++) {
      const cellRow = [];
      for (let colCount = 0; colCount < this.size.width; colCount++) {
        const cell = new Cell(colCount, rowCount, false);
        cellRow.push(cell);
      }
      cells.push(cellRow);
    }
    // neighborの設定
    for (let rowCount = 0; rowCount < this.size.height; rowCount++) {
      const cellRow = cells[rowCount];
      for (let colCount = 0; colCount < this.size.width; colCount++) {
        const cell = cellRow[colCount];

        NEIGHBOURS.forEach(diff => {
          if (0 <= rowCount + diff.y && rowCount + diff.y < this.size.height && 0 <= colCount + diff.x && colCount + diff.x < this.size.width) {
            cell.neighbors.push(cells[rowCount + diff.y][colCount + diff.x]);
          }
        });
      }
    }
    return cells;
  }

  /**
   * セルのON/OFF切り替え
   * @param cell 切り替え対象セル
   */
  toggleCell(cell: Cell) {
    cell.alived = !cell.alived;
  }

  /**
   * 1ライフサイクル進める
   */
  tick() {
    // Cellsのコピーを作成
    const newCells = this.newCells();

    // neighborを元に次のON/OFFを決定、設定する
    for (let row = 0; row < this.size.height; row++) {
      for (let col = 0; col < this.size.width; col++) {
        newCells[row][col].alived = this.aliveInNextTick(this.cells[row][col]);
      }
    }

    // 現在のCellsと置き換える
    // const oldCells = this.cells;
    this.cells = newCells;

    // 古いcellsを破棄,,,は不要？（メモリリーク防止）
  }

  /**
   * 次の世代でAlivedかどうかの判断。標準的なライフゲームのルールに従う。
   * @param cell 対象セル
   * @returns 近傍Aliveセルが3ならtrue、または自身がaliveで、近傍Aliveセルが2からtrue、それ以外はfalse
   */
  aliveInNextTick(cell: Cell): boolean {
    if (!cell.neighbors) {
      return false;
    }
    const aliveAmount = cell.neighbors.filter(neighbor => neighbor.alived).length;
    return (aliveAmount === 3 || (cell.alived && aliveAmount === 2));
  }

  start() {
    this.timerObj = interval(this.period).subscribe(_ => this.tick());
  }

  stop() {
    if (this.timerObj) {
      this.timerObj.unsubscribe();
      this.timerObj = null;
    }
  }

}
