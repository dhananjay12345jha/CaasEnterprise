export class StockUpdate {
  get time(): string {
    return this._time;
  }

  set time(value: string) {
    this._time = value;
  }

  get updateType(): string {
    return this._updateType;
  }

  set updateType(value: string) {
    this._updateType = value;
  }

  get quantity(): Number {
    return this._quantity;
  }

  set quantity(value: Number) {
    this._quantity = value;
  }

  get sku(): string {
    return this._sku;
  }

  set sku(value: string) {
    this._sku = value;
  }

  get brand(): string {
    return this._brand;
  }

  set brand(value: string) {
    this._brand = value;
  }

  private _brand!: string;
  private _sku!: string;
  private _quantity!: Number;
  private _updateType!: string;
  private _time!: string;
}
