import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UserauthService {

  constructor() { }

  public setToken(token:string) {
    localStorage.setItem('token', token)
  }

  public getToken(): string {
  return localStorage.getItem('token');
 }

 public clear(){
   localStorage.clear();
 }

 public isLoggedIn() {
   return this.getToken() ? true : false;
 }
}
