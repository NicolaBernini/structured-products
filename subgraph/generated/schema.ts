// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.

import {
  TypedMap,
  Entity,
  Value,
  ValueKind,
  store,
  Address,
  Bytes,
  BigInt,
  BigDecimal
} from "@graphprotocol/graph-ts";

export class InstrumentPosition extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id !== null, "Cannot save InstrumentPosition entity without an ID");
    assert(
      id.kind == ValueKind.STRING,
      "Cannot save InstrumentPosition entity with non-string ID. " +
        'Considering using .toHex() to convert the "id" to a string.'
    );
    store.set("InstrumentPosition", id.toString(), this);
  }

  static load(id: string): InstrumentPosition | null {
    return store.get("InstrumentPosition", id) as InstrumentPosition | null;
  }

  get id(): string {
    let value = this.get("id");
    return value.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get instrumentAddress(): Bytes {
    let value = this.get("instrumentAddress");
    return value.toBytes();
  }

  set instrumentAddress(value: Bytes) {
    this.set("instrumentAddress", Value.fromBytes(value));
  }

  get account(): Bytes {
    let value = this.get("account");
    return value.toBytes();
  }

  set account(value: Bytes) {
    this.set("account", Value.fromBytes(value));
  }

  get cost(): BigInt {
    let value = this.get("cost");
    return value.toBigInt();
  }

  set cost(value: BigInt) {
    this.set("cost", Value.fromBigInt(value));
  }

  get exercised(): boolean {
    let value = this.get("exercised");
    return value.toBoolean();
  }

  set exercised(value: boolean) {
    this.set("exercised", Value.fromBoolean(value));
  }

  get amount(): BigInt {
    let value = this.get("amount");
    return value.toBigInt();
  }

  set amount(value: BigInt) {
    this.set("amount", Value.fromBigInt(value));
  }

  get optionTypes(): Array<i32> {
    let value = this.get("optionTypes");
    return value.toI32Array();
  }

  set optionTypes(value: Array<i32>) {
    this.set("optionTypes", Value.fromI32Array(value));
  }

  get strikePrices(): Array<BigInt> {
    let value = this.get("strikePrices");
    return value.toBigIntArray();
  }

  set strikePrices(value: Array<BigInt>) {
    this.set("strikePrices", Value.fromBigIntArray(value));
  }

  get venues(): Array<string> {
    let value = this.get("venues");
    return value.toStringArray();
  }

  set venues(value: Array<string>) {
    this.set("venues", Value.fromStringArray(value));
  }

  get expiry(): BigInt {
    let value = this.get("expiry");
    return value.toBigInt();
  }

  set expiry(value: BigInt) {
    this.set("expiry", Value.fromBigInt(value));
  }

  get exerciseProfit(): BigInt | null {
    let value = this.get("exerciseProfit");
    if (value === null || value.kind == ValueKind.NULL) {
      return null;
    } else {
      return value.toBigInt();
    }
  }

  set exerciseProfit(value: BigInt | null) {
    if (value === null) {
      this.unset("exerciseProfit");
    } else {
      this.set("exerciseProfit", Value.fromBigInt(value as BigInt));
    }
  }
}
