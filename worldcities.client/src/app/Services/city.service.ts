import { Injectable } from "@angular/core";
import { ApiResult, BaseService } from "./base.service";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { City } from '../cities/city';  
import { Country } from "../countries/country";

@Injectable({
    providedIn: 'root'
})

export  class CityService extends BaseService<City>{

        constructor(http: HttpClient){
            super(http)
        }

 override getData(pageIndex: number,pageSize: number,sortColumn: string, sortOrder: string,
          filterColumn: string | null, filterQuery: string | null): Observable<ApiResult<City>>
     {
     var url = this.getUrl("api/Cities")
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
    return this.http.get<ApiResult<City>>(url , {params})
  }

   override get(id: number): Observable<City> {
      var url = this.getUrl("api/Cities/" + id)
      return this.http.get<City>(url)
  }

  override put(item: City): Observable<City> {
      var url = this.getUrl("api/Cities/" + item.id)
      return this.http.put<City>(url ,item)
  }

  override post(item: City): Observable<City> { 
    var url = this.getUrl("api/Cities");
    return this.http.post<City>(url, item); 
  } 

   override delete(id: number): Observable<City> {
    var url = this.getUrl("api/Cities/" + id)
    return this.http.delete<City>(url)
  }

   getCountries(pageIndex: number,pageSize: number,sortColumn: string, sortOrder: string,
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
   
  isDupeCity(item:City): Observable<boolean>{
    var url = this.getUrl("api/Cities/IsDupeCity")
    return this.http.post<boolean>(url, item)
  }


}