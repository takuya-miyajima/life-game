import { Component, OnInit } from '@angular/core';
import { Cell } from '../entity/cell';
import { timer, interval, Observable, Subscription } from 'rxjs';
import { Form, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { CustomValidator } from '../validator/custom-validator';

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

  // 表示用
  cells: Cell[][];

  // 計算用（順次遷移する状態を計算するため2枚用意）。キーとして1か-1を取る
  calcCells = {};
  // calcCellsのどちらを参照するかを表すインデックス。1か-1のみを取る。
  cellsIndex: number;
  // 各初期値
  size = {
    width: 100,
    height: 100
  };
  period = 100;

  // フォームコントロール
  inputPeriod = this.period;
  inputWidth = this.size.width;
  inputHeight = this.size.height;
  formGroup: FormGroup;
  periodControl: FormControl;
  widthControl: FormControl;
  heightControl: FormControl;

  // タイマー
  timerObj: Subscription;

  constructor(private builder: FormBuilder) {
  }

  ngOnInit(): void {
    this.periodControl = new FormControl('', [CustomValidator.period]);
    this.widthControl = new FormControl('', [CustomValidator.size]);
    this.heightControl = new FormControl('', [CustomValidator.size]);
    this.calcCells = {};
    this.calcCells["-1"] = this.newCells();
    this.calcCells["1"] = this.newCells();
    this.cellsIndex = 1;
    this.cells = this.calcCells[String(this.cellsIndex)];
  }

  getPeriodMessage() {
    return CustomValidator.getPeriodMessage();
  }

  getSizeMessage() {
    return CustomValidator.getSizeMessage();
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
    const currentCells = this.calcCells[this.cellsIndex];
    this.cellsIndex *= -1;
    const newCells = this.calcCells[this.cellsIndex];

    // neighborを元に次のON/OFFを決定、設定する
    for (let row = 0; row < this.size.height; row++) {
      for (let col = 0; col < this.size.width; col++) {
        newCells[row][col].alived = this.aliveInNextTick(currentCells[row][col]);
      }
    }

    // 現在のCellsと置き換える
    this.cells = newCells;
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

  /**
   * periodごとに世代更新開始
   */
  start() {
    this.timerObj = interval(this.period).subscribe(_ => this.tick());
  }

  /**
   * 世代更新停止
   */
  stop() {
    if (this.timerObj) {
      this.timerObj.unsubscribe();
      this.timerObj = null;
    }
  }

  /**
   * 盤面をクリアする
   */
  clear() {
    const currentCells = this.calcCells[this.cellsIndex];

    for (let row = 0; row < this.size.height; row++) {
      for (let col = 0; col < this.size.width; col++) {
        currentCells[row][col].alived = false;
      }
    }
  }

  /**
   * 盤面全体のステータスをランダムにする
   */
  random() {
    const currentCells = this.calcCells[this.cellsIndex];

    for (let row = 0; row < this.size.height; row++) {
      for (let col = 0; col < this.size.width; col++) {
        currentCells[row][col].alived = (Math.random() < 0.5);
      }
    }
  }

  applyPeriod() {
    if (this.periodControl.errors.tooShort) {
      return;
    }

    this.period = this.inputPeriod;

    if (this.timerObj) {
      this.stop();
      this.start();
    }
  }

  applySize() {
    if (this.widthControl.errors.outOfRange || this.heightControl.errors.outOfRange) {
      return;
    }

    this.size = {
      width: this.inputWidth,
      height: this.inputHeight
    };

    this.stop();
    this.calcCells[this.cellsIndex] = this.newCells();
    this.calcCells[-1 * this.cellsIndex] = this.newCells();
    this.cells = this.calcCells[this.cellsIndex];

  }
}
