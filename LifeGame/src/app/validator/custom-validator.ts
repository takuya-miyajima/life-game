import { FormControl } from "@angular/forms";

// // 最小更新間隔
const MIN_PERIOD = 100;

// 最小サイズ
const MIN_SIZE = 10;

// 最大サイズ
const MAX_SIZE = 500;

export class CustomValidator {
  /**
  * 最小更新間隔チェック
  *
  * @param formControl フォームコントロール
  * @return true: 最小更新間隔未満 false: それ以外
  */
  public static period(formControl: FormControl) {
    let tooShort = false;
    const value = 0 + formControl.value;
    tooShort = (value < MIN_PERIOD);
    return { tooShort: tooShort };
  }

  public static getPeriodMessage() {
    return 'period should be more than ' + MIN_PERIOD;
  }

  /**
   * 盤面サイズチェック
   *
   * @param formControl フォームコントロール
   * @return true: サイズが最大・最小の範囲内の場合 false: それ以外、もしくは値無し
   */
  public static size(formControl: FormControl) {
    let outOfRange = false;
    const value = 0 + formControl.value;
    outOfRange = (value < MIN_SIZE || MAX_SIZE < value);

    return { outOfRange: outOfRange };
  }

  public static getSizeMessage() {
    return `size should be between ${MIN_SIZE} and ${MAX_SIZE}`;
  }
}
