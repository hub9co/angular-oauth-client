import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';
import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';

export class AuthServiceConfig {
  apiId: string;
  apiSecret: string;
  apiUrl: string;
  unauthorizedRoute: string;
}

@Injectable()
export class AuthService {
  isAuthenticated: boolean = false;
  token: string = null;
  me: any = {};
  private authData: any = {};

  constructor(private config: AuthServiceConfig, private http: Http) {
    let t = window.localStorage.getItem('auth_data');

    if (t != null) {
      this.authData = JSON.parse(t);
      this.token = this.authData.access_token;
      this.isAuthenticated = true;
      if (this.authData.expiration <= new Date().getTime() + 100000) {
        this.refresh_token().subscribe();
      }
    }
  }

  login(username: string, password: string): Observable<any> {
    let data = 'username=' + username + '&password=' + password + '&grant_type=password&client_id=' +
      this.config.apiId + '&client_secret=' + this.config.apiSecret;
    let headers = new Headers({'Content-Type': 'application/x-www-form-urlencoded'});
    let options = new RequestOptions({headers: headers});

    let r = this.http.post(this.config.apiUrl + 'o/token/', data, options);
    return r.map(res => {
      this.authData = res.json();
      this.token = this.authData.access_token;
      this.isAuthenticated = true;
      this.authData.expiration = new Date().getTime() + (this.authData.expires_in * 1000);
      window.localStorage.setItem('auth_data', JSON.stringify(this.authData));
      return this.authData;
    });
  }

  logout(): void {
    this.token = null;
    this.isAuthenticated = false;
    this.authData = {};
    window.localStorage.removeItem('auth_data');
  }

  refresh_token(): Observable<any> {
    let data = 'grant_type=refresh_token&client_id=' + this.config.apiId + '&client_secret=' +
      this.config.apiSecret + '&refresh_token=' + this.authData.refresh_token;
    let headers = new Headers({
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Bearer ' + this.authData.refresh_token
    });
    let options = new RequestOptions({headers: headers});

    return this.http.post(this.config.apiUrl + 'o/token/', data, options)
      .do(d => {
      }, e => {
        if (e.status === 401) {
          this.logout();
        }
      })
      .map(res => {
        this.authData = res.json();
        this.token = this.authData.access_token;
        this.isAuthenticated = true;
        this.authData.expiration = new Date().getTime() + (this.authData.expires_in * 1000);
        window.localStorage.setItem('auth_data', JSON.stringify(this.authData));
        return this.authData;
      });
  }

  getToken(): Observable<any> {
    return Observable.create(observer => {
      if (this.token != null) {
        if (!this.authData.expiration || this.authData.expiration <= new Date().getTime() + 100000) {
          this.refresh_token().subscribe(d => {
            observer.next(this.token);
            observer.complete();
          });
        } else {
          observer.next(this.token);
          observer.complete();
        }
      } else {
        observer.next(null);
        observer.complete();
      }
    });
  }

  request(method: string, url: string, data: any = {}, headers: any = new Headers()): Observable<any> {
    let formData: FormData = new FormData();
    let hasFile = assignFormdata(formData, data);
    if (!hasFile) {
      data = JSON.stringify(data);
    } else {
      data = formData;
    }

    return Observable.create(obs => {
      this.getToken().subscribe(d1 => {
        headers.append('Authorization', 'Bearer ' + this.token);
        headers.append('Content-Type', 'application/json');
        let options = new RequestOptions({method: method, headers: headers, body: data});

        this.http.request(this.config.apiUrl + 'api/' + url, options).subscribe(
          d2 => {
            if (d2.status === 204) {
              obs.next(null);
            } else {
              obs.next(d2.json());
            }
          },
          e => {
            if (e.status === 401) {
              this.logout();
            }
            obs.error(e);
          },
          () => obs.complete()
        );
      });
    });
  }

  get(url: string): Observable<any> {
    return this.request('GET', url);
  }

  post(url: string, data: any): Observable<any> {
    return this.request('POST', url, data);
  }

  patch(url: string, data: any): Observable<any> {
    return this.request('PATCH', url, data);
  }

  delete(url: string): Observable<any> {
    return this.request('DELETE', url);
  }
}


function assignFormdata(formdata: FormData, data: any) {
  let hasFile = false;
  for (let i in data) {
    if (data[i] instanceof File) {
      formdata.append(i, data[i]);
      hasFile = true;
    } else if (data[i] instanceof Object) {
      formdata.append(i, JSON.stringify(data[i]));
    } else {
      formdata.append(i, data[i]);
    }
  }
  return hasFile;
}