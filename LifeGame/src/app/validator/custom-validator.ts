import { AbstractControl, ValidationErrors } from '@angular/forms';

const MIN_PERIOD = 100;
const MIN_SIZE = 10;
const MAX_SIZE = 500;

export class CustomValidator {
  static period(control: AbstractControl): ValidationErrors | null {
    const value: unknown = control.value;
    return typeof value === 'number' && Number.isFinite(value) && value >= MIN_PERIOD
      ? null : { tooShort: true };
  }

  static getPeriodMessage(): string {
    return `period should be at least ${MIN_PERIOD} msec`;
  }

  static size(control: AbstractControl): ValidationErrors | null {
    const value: unknown = control.value;
    return typeof value === 'number' && Number.isInteger(value) && value >= MIN_SIZE && value <= MAX_SIZE
      ? null : { outOfRange: true };
  }

  static getSizeMessage(): string {
    return `size should be an integer between ${MIN_SIZE} and ${MAX_SIZE}`;
  }
}
