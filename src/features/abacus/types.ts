// src/features/abacus/types.ts
export type Operator = "+" | "-";

export interface AbacusQuestion {
  a: number;
  b: number;
  operator: Operator;
  answer: number;
  options: number[];
}