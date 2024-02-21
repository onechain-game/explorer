import type { Coin, Key, PaginatedResponse } from "./common"

export interface ActionLog {
  id: number,
  gameId: string,
  questId: string,
  gamePublisherId: string,
  receiveAddress: string,
  apAmount: number,
  claimTime: string,
}

export interface PaginatedActionLog extends PaginatedResponse {
  actionLogs: ActionLog[]
}