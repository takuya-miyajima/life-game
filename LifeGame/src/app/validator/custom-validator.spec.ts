import { FormControl } from '@angular/forms';
import { CustomValidator } from './custom-validator';

describe('CustomValidator', () => {
  it.each([100, 200, 1000])('accepts a valid period: %s', value => {
    expect(CustomValidator.period(new FormControl(value))).toBeNull();
  });

  it.each([null, '', '100', 0, 99, NaN, Infinity])('rejects an invalid period: %s', value => {
    expect(CustomValidator.period(new FormControl(value))).toEqual({ tooShort: true });
  });

  it.each([10, 100, 500])('accepts a valid size: %s', value => {
    expect(CustomValidator.size(new FormControl(value))).toBeNull();
  });

  it.each([null, '', '10', 9, 501, 10.5, NaN, Infinity])('rejects an invalid size: %s', value => {
    expect(CustomValidator.size(new FormControl(value))).toEqual({ outOfRange: true });
  });
});
