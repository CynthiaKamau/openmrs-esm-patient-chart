import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { catchError, map } from 'rxjs/operators';
import { Observable } from 'rxjs';

import { WindowRef } from '../window-ref';
import { SubLocation, ListResult } from '../types';

@Injectable()
export class SubLocationResourceService {
  constructor(protected http: HttpClient, protected windowRef: WindowRef) {}

  private getSubLocationByUuidFallback(name: string): Observable<SubLocation | undefined> {
    return this.getAllSubLocations().pipe(map((locations) => locations.find((location) => location.name === name)));
  }

  public getSubLocationByName(name: string): Observable<SubLocation | undefined> {
    const url = this.getUrl();
    return this.http.get<SubLocation>(url).pipe(catchError(() => this.getSubLocationByUuidFallback(name)));
  }

  public searchSubLocation(searchText: string): Observable<Array<SubLocation>> {
    return this.getAllSubLocations().pipe(
      map((locations) =>
        locations.filter((location) => location.name.toLowerCase().includes(searchText.toLowerCase())),
      ),
    );
  }

  private getAllSubLocations(): Observable<Array<SubLocation>> {
    const url = this.getUrl();
    return this.http.get<ListResult<SubLocation>>(url).pipe(map((r) => r.results));
  }

  public getUrl() {
    return this.windowRef.openmrsRestBase + 'module/addresshierarchy/ajax/getChildAddressHierarchyEntries.form';
  }
}
