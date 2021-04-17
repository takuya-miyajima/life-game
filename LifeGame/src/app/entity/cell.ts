/**
 * Cell
 */
export class Cell {
  position: {
    x: number;
    y: number;
  };
  alived: boolean;
  neighbors: Cell[];

  constructor(x: number, y: number, alived: boolean) {
    this.position = {
      x: x,
      y: y
    };
    this.alived = alived;
    this.neighbors = [];
  }
}
