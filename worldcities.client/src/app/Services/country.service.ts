import { Injectable } from '@angular/core';
import { ApiResult, BaseService } from './base.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Country } from '../countries/country';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CountryService extends BaseService<Country> {
  constructor(http: HttpClient) { 
    super(http)
  }
  
  override getData(pageIndex: number, pageSize: number, sortColumn: string, sortOrder: string, 
    filterColumn: string | null, filterQuery: string | null): Observable<ApiResult<Country>>
     {
        var url = this.getUrl("api/Countries")
        var params = new HttpParams()
        .set("pageIndex", pageIndex.toString())
        .set("pageSize", pageSize.toString())
        .set("sortColumn", sortColumn)
        .set("sortOrder", sortOrder);

        if (filterQuery && filterColumn) {
          params = params
          .set("filterColumn", filterColumn)
          .set("filterQuery", filterQuery);
        }
        return this.http.get<ApiResult<Country>>(url , {params})
  }
  override get(id: number): Observable<Country> {
    var url = this.getUrl("api/Countries/" + id)
    return this.http.get<Country>(url)
  }
  override put(item: Country): Observable<Country> {
    var url = this.getUrl("api/Countries/" + item.id); 
    return this.http.put<Country>(url, item);
  }
  override post(item: Country): Observable<Country> {
    var url = this.getUrl("api/Countries"); 
    return this.http.post<Country>(url, item);
  }

  override delete(id: number): Observable<Country> {
    var url = this.getUrl("api/Countries/" + id)
    return this.http.delete<Country>(url)
  }

  isDupeField(countryId: number, fieldName:string, fieldValue:string){
    var params = new HttpParams()
    .set("countryId",countryId)
    .set("fieldName", fieldName)
    .set("fieldValue", fieldValue);
    var url = this.getUrl("api/Countries/IsDupeField")
    return this.http.post<boolean>(url, null, {params})
  }

}