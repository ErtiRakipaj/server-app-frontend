import { Router } from '@angular/router';
import { UserauthService } from './userauth.service';
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError, Observable, throwError } from "rxjs";

@Injectable()
export class AuthInterceptor implements HttpInterceptor{

  constructor(private userAuthService: UserauthService, private router:Router){}


  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    if(req.headers.get("No-Auth") === "True") {
      return next.handle(req.clone())
    }

    const token = this.userAuthService.getToken();
    req= this.addToken(req,token);

    return next.handle(req).pipe(
      catchError(
        (err:HttpErrorResponse) => {
          console.log(err.status);
          if(err.status === 401) {
            this.router.navigate(['/login'])
          } else if(err.status === 403){
            this.router.navigate(['/login'])
          }
          return throwError("Something is wrong")
        }
      )
    );
  }

  private addToken(request:HttpRequest<any>, token:string) {
    return request.clone(
      {
        setHeaders: {
          Authorization : `Bearer ${token}`
        }
      }
    );
  }

}
