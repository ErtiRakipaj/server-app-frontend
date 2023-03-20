// import { CustomResponse } from 'src/app/interface/custom-response';
import { Status } from './../enums/status.enum';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, Subscriber, tap,throwError} from 'rxjs';
import { CustomResponse } from '../interface/custom-response';
import { Server } from '../interface/server';

@Injectable({
  providedIn: 'root'
})
export class ServerService {

  private readonly apiUrl = 'http://localhost:8080';
  customResponse:CustomResponse;



  constructor(private http: HttpClient) { }

  servers$ = <Observable<CustomResponse>>
  this.http.get<CustomResponse>(`${this.apiUrl}/servers`)
  .pipe(
    tap(console.log),
    catchError(this.handleError)
  );


  save$ = (server: Server) => <Observable<CustomResponse>>
  this.http.post<CustomResponse>(`${this.apiUrl}/servers/save`,server)
  .pipe(
    tap(console.log),
    catchError(this.handleError)
  );


  ping$ = (ip: String) => <Observable<CustomResponse>>
  this.http.get<CustomResponse>(`${this.apiUrl}/servers/ping/${ip}`)
  .pipe(
    tap(console.log),
    catchError(this.handleError)
  );

  filter$ = (status: Status, response: CustomResponse) => <Observable<CustomResponse>>
  new Observable<CustomResponse>(
    Subscriber => {
      console.log(response);
      Subscriber.next(
        status === Status.ALL ? {...response,message: `Servers filtered by ${status} status`} :
        {
          ... response,
          message: response.data.servers.filter(server => server.status === status) .length > 0 ? `Server filtered by ${status === Status.ACTIVE ? 'ACTIVE ' : 'INACTIVE '}STATUS` : `No servers of ${status} found`,
          data:{servers: response.data.servers.filter(server=>server.status === status)}
        }
      );
      Subscriber.complete();
    }
  )
  .pipe(
    tap(console.log),
    catchError(this.handleError)
  );


  delete$ = (id: Number) =><Observable<CustomResponse>>
  this.http.delete<CustomResponse>(`${this.apiUrl}/servers/delete/${id}`)
  .pipe(
    tap(console.log),
    catchError(this.handleError)
  );

  private handleError(error: HttpErrorResponse):Observable<never> {
    console.log(error);
    return throwError(() => new Error(`Something went wrong -- Code: ${error.status}`));
  }

}
