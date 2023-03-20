import { Status } from "../enums/status.enum";

export interface Server {
  id: Number,
  ip: String,
  imageUrl: String,
  location: String,
  companyName: String,
  status: Status,

}
