export class Address {
  get mobile(): string {
    return this._mobile;
  }

  set mobile(value: string) {
    this._mobile = value;
  }

  get phone(): string {
    return this._phone;
  }

  set phone(value: string) {
    this._phone = value;
  }

  get email(): string {
    return this._email;
  }

  set email(value: string) {
    this._email = value;
  }

  get additionalAddressInfo(): string {
    return this._additionalAddressInfo;
  }

  set additionalAddressInfo(value: string) {
    this._additionalAddressInfo = value;
  }

  get pOBox(): string {
    return this._pOBox;
  }

  set pOBox(value: string) {
    this._pOBox = value;
  }

  get apartment(): string {
    return this._apartment;
  }

  set apartment(value: string) {
    this._apartment = value;
  }

  get building(): string {
    return this._building;
  }

  set building(value: string) {
    this._building = value;
  }

  get department(): string {
    return this._department;
  }

  set department(value: string) {
    this._department = value;
  }

  get company(): string {
    return this._company;
  }

  set company(value: string) {
    this._company = value;
  }

  get state(): string {
    return this._state;
  }

  set state(value: string) {
    this._state = value;
  }

  get region(): string {
    return this._region;
  }

  set region(value: string) {
    this._region = value;
  }

  get city(): string {
    return this._city;
  }

  set city(value: string) {
    this._city = value;
  }

  get postalCode(): string {
    return this._postalCode;
  }

  set postalCode(value: string) {
    this._postalCode = value;
  }

  get additionalStreetInfo(): string {
    return this._additionalStreetInfo;
  }

  set additionalStreetInfo(value: string) {
    this._additionalStreetInfo = value;
  }

  get streetNumber(): string {
    return this._streetNumber;
  }

  set streetNumber(value: string) {
    this._streetNumber = value;
  }

  get streetName(): string {
    return this._streetName;
  }

  set streetName(value: string) {
    this._streetName = value;
  }

  get lastName(): string {
    return this._lastName;
  }

  set lastName(value: string) {
    this._lastName = value;
  }

  get firstName(): string {
    return this._firstName;
  }

  set firstName(value: string) {
    this._firstName = value;
  }

  get salutation(): string {
    return this._salutation;
  }

  set salutation(value: string) {
    this._salutation = value;
  }

  get title(): string {
    return this._title;
  }

  set title(value: string) {
    this._title = value;
  }

  get key(): string {
    return this._key;
  }

  set key(value: string) {
    this._key = value;
  }

  get country(): string {
    return this._country;
  }

  set country(value: string) {
    this._country = value;
  }

  get id(): string {
    return this._id;
  }

  set id(value: string) {
    this._id = value;
  }

  private _id!: string;
  private _country!: string;
  private _key!: string;
  private _title!: string;
  private _salutation!: string;
  private _firstName!: string;
  private _lastName!: string;
  private _streetName!: string;
  private _streetNumber!: string;
  private _additionalStreetInfo!: string;
  private _postalCode!: string;
  private _city!: string;
  private _region!: string;
  private _state!: string;
  private _company!: string;
  private _department!: string;
  private _building!: string;
  private _apartment!: string;
  private _pOBox!: string;
  private _additionalAddressInfo!: string;
  private _email!: string;
  private _phone!: string;
  private _mobile!: string;
}
