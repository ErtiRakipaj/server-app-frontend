import { AuthService } from './../../service/auth.service';
import { Router } from '@angular/router';
import { UserauthService } from './../../service/userauth.service';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Observable, BehaviorSubject, map, startWith, catchError, of, delay, tap } from 'rxjs';
import { DataState } from 'src/app/enums/data-state.enum';
import { Status } from 'src/app/enums/status.enum';
import { AppState } from 'src/app/interface/app-state';
import { CustomResponse } from 'src/app/interface/custom-response';
import { Server } from 'src/app/interface/server';
import { NotificationService } from 'src/app/service/notification.service';
import { ServerService } from 'src/app/service/server.service';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-server',
  templateUrl: './server.component.html',
  styleUrls: ['./server.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ServerComponent implements OnInit {
  appState$ : Observable<AppState<CustomResponse>>;

  readonly DataState = DataState;

  readonly Status = Status;

  private filterSubject = new BehaviorSubject<String>('');

  private dataSubject = new BehaviorSubject<CustomResponse>(null);

  filterStatus$ = this.filterSubject.asObservable();

  private isLoading = new BehaviorSubject<Boolean>(false);

  isLoading$ = this.isLoading.asObservable();

  constructor(private serverService: ServerService, private notifier: NotificationService, private userAuthService:UserauthService, private router:Router, private authService:AuthService) {}



     extractUsername():string{
      const parts = this.userAuthService.getToken().split('.');

      const payload = JSON.parse(atob(parts[1]));

      const username = payload.sub;

      return username;
     }

     loggedUser : string = this.extractUsername();


  ngOnInit() : void {
    this.appState$ = this.serverService.servers$
    .pipe(
      map(Response => {

        this.notifier.onDefault(Response.message);

        this.dataSubject.next(Response);
        return { dataState: DataState.LOADED_STATE, appData: { ...Response, data: { servers: Response.data.servers.reverse() } } }
      }),
      startWith({ dataState: DataState.LOADING_STATE }),
      catchError((error:string) => {
        this.notifier.onError(error);
        setTimeout(() => {
          window.location.reload();
        }, 3000);
        return of({ dataState: DataState.ERROR_STATE, error });

      })
    );
  }

  pingServer(ip: String) : void {
    this.filterSubject.next(ip);
    this.appState$ = this.serverService.ping$(ip)
    .pipe(
      map(Response => {
        const index = this.dataSubject.value.data.servers.findIndex(server =>
          server.id === Response.data.server.id);
        this.dataSubject.value.data.servers[index] = Response.data.server;
        this.notifier.onDefault(Response.message);
        this.filterSubject.next('');
        return { dataState: DataState.LOADED_STATE, appData: this.dataSubject.value }
      }),
      startWith({ dataState: DataState.LOADED_STATE, appData: this.dataSubject.value }),
      catchError((error:string) => {
        this.filterSubject.next('');
        this.notifier.onError(error);
        setTimeout(() => {
          window.location.reload();
        }, 3000);
        return of({ dataState: DataState.ERROR_STATE, error })
      })
    );
  }



  saveServer(serverForm: NgForm) : void {
    this.isLoading.next(true);
    const ip = `${serverForm.value.ip1.toString()}.${serverForm.value.ip2.toString()}.${serverForm.value.ip3.toString()}.${serverForm.value.ip4.toString()}`;
    const server = {
        ...serverForm.value,
        ip
    };

    this.appState$ = this.serverService.save$(server)

    .pipe(
      map(Response => {
        this.dataSubject.next(

          {...Response, data: { servers: [Response.data.server, ...this.dataSubject.value.data.servers] } }
        );

        this.notifier.onDefault(Response.message);
        document.getElementById('closeModal').click();
        this.isLoading.next(false);
        serverForm.resetForm({ status: this.Status.INACTIVE });
        return { dataState: DataState.LOADED_STATE, appData: this.dataSubject.value }
      }),
      startWith({ dataState: DataState.LOADED_STATE, appData: this.dataSubject.value }),
      catchError((error:string) => {
        this.isLoading.next(false);
        this.notifier.onError(error);
        setTimeout(() => {
          window.location.reload();
        }, 3000);
        return of({ dataState: DataState.ERROR_STATE, error });
      })
    );
  }



  filterServers(status: string) : void {

    let serverStatus = Status[status];

    this.appState$ = this.serverService.filter$(serverStatus, this.dataSubject.value)
    .pipe(
      map(Response => {
        this.notifier.onDefault(Response.message);
        return { dataState: DataState.LOADED_STATE, appData: Response }
      }),
      startWith({ dataState: DataState.LOADED_STATE, appData: this.dataSubject.value }),
      catchError((error:string) => {
        this.notifier.onError(error);
        setTimeout(() => {
          window.location.reload();
        }, 3000);
        return of({ dataState: DataState.ERROR_STATE, error });
      })
    );
  }


  deleteServer(server: Server) : void {

    this.appState$ = this.serverService.delete$(server.id)
    .pipe(
      map(Response => {
        this.dataSubject.next(
          { ...Response, data:
            { servers: this.dataSubject.value.data.servers.filter(s => s.id !== server.id) } }
        );
        this.notifier.onDefault(Response.message);
        return { dataState: DataState.LOADED_STATE, appData: this.dataSubject.value }
      }),
      startWith({ dataState: DataState.LOADED_STATE, appData: this.dataSubject.value }),
      catchError((error:string) => {
        this.notifier.onError(error);
        setTimeout(() => {
          window.location.reload();
        }, 3000);
        return of({ dataState: DataState.ERROR_STATE, error });
      })
    );
  }


  printReportAsExcel(): void {
    this.notifier.onDefault('Report.xls Downloaded');
    let dataType = 'application/vnd.ms-excel.sheet.macroEnabled.12';
    let tableSelect = document.getElementById('servers');
    let tableHtml = tableSelect.outerHTML.replace(/ /g, '%20');
    let downloadLink = document.createElement('a');
    document.body.appendChild(downloadLink);
    downloadLink.href = 'data:' + dataType + ', ' + tableHtml;
    downloadLink.download = 'server-report.xls';
    downloadLink.click();
    document.body.removeChild(downloadLink);
  }

  printReportAsPDF(): void {
    this.notifier.onDefault('Report.pdf Downloaded');
     html2canvas(document.getElementById('servers')).then(function(canvas) {
      var imgData = canvas.toDataURL('image/png');

      var imgWidth = 210;
      var pageHeight = (canvas.height/canvas.width) *imgWidth;

      var doc = new jsPDF('p', 'mm', 'a4');
      doc.addImage(imgData, 'PNG', 0,0,imgWidth,pageHeight);

      doc.save('report.pdf');
     });
    }

  public logout() {
      this.userAuthService.clear();

      this.router.navigate(['/login'])

  }
}
