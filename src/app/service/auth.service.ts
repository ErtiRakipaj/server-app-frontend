import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  PATH_OF_API = "http://localhost:8080"
  requestHeader = new HttpHeaders(
    { "No-Auth":"True" }
  );

  constructor(private httpClient:HttpClient) { }

  public login(loginData) {
    return this.httpClient.post(this.PATH_OF_API + "/auth/login",loginData, {headers: this.requestHeader})
  }

  public register(registerData) {
    return this.httpClient.post(this.PATH_OF_API + "/auth/register",registerData, {headers: this.requestHeader})
  }


}
