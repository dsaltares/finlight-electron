import {
  ColumnType,
  Generated,
  Selectable,
  Updateable,
  Insertable
} from 'kysely'

export interface Database {
  exchangeRate: ExchangeRateTable
}

export interface ExchangeRateTable {
  id: Generated<string>
  ticker: string
  open: number
  low: number
  high: number
  close: number
  date: Date
  createdAt: Generated<Timestamp>
  updatedAt: Generated<Timestamp>
}

export type ExchangeRate = Selectable<ExchangeRateTable>
export type NewExchangeRate = Insertable<ExchangeRateTable>
export type ExchangeRateUpdate = Updateable<ExchangeRateTable>

export type Timestamp = ColumnType<Date, Date | string, Date | string>;
