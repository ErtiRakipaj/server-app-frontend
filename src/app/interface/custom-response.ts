import { Server } from "./server";

export interface CustomResponse {
  timestamp: Date;
  statusCode: Number;
  status: String;
  reason: String;
  message: string;
  developerMessage: String;
  data: {servers?: Server[], server?: Server};
}
