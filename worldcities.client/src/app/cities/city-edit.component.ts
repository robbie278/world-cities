import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators,  AbstractControl, AsyncValidatorFn } from '@angular/forms';
import { City } from './city';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Country } from '../countries/country';
import { BaseFormComponent } from '../base-form.component';
import { CityService } from '../Services/city.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-city-edit',
  templateUrl: './city-edit.component.html',
  styleUrl: './city-edit.component.scss'
})
export class CityEditComponent extends BaseFormComponent implements OnInit  {

title?: string
 city?:City
  id?: number

 countries?:Country[] 

 constructor( private activatedRoute: ActivatedRoute,  
              private router: Router,   
              private cityService: CityService,
              private toastr:ToastrService
               )
  {
  super()
 }

 ngOnInit() {
   this.form = new FormGroup({
     name: new FormControl('' , Validators.required ),
     lat: new FormControl('', [ Validators.required, Validators.pattern(/^[-]?[0-9]+(\.[0-9]{1,4})?$/) ]),
     lon: new FormControl('', [ Validators.required, Validators.pattern(/^[-]?[0-9]+(\.[0-9]{1,4})?$/) ]),
     pop: new FormControl('', Validators.required ),
 countryId: new FormControl('', Validators.required )
   }, null , this.isDupeCity())

   this.loadData()
 }

 loadData(){

  this.loadCountries()
      // retrieve the ID from the 'id' parameter 
  var idParam = this.activatedRoute.snapshot.paramMap.get('id')
   this.id = idParam ? +idParam : 0

  if(this.id){
    //Edit Mode

     // fetch the city from the server 
    this.cityService.get(this.id).subscribe({
      next:(result) => {
        this.city = result
        this.title = "Edit - " + this.city.name
       // update the form with the city value 
        this.form.patchValue(this.city)
      },
      error: (err) => console.log(err)
    })

  }
  else{
    //Add New Mode

    this.title = " Create a New City"
  }
     
}

loadCountries() {
  // fetch all the countries from the server
 this.cityService.getCountries(0,9999,"name","asc",null,null).subscribe({
    next: (result) => {
      this.countries = result.data;
    },
    error: (error) => console.error(error)
  });
}



onSubmit(){
  var city = (this.id) ? this.city: <City>{}

  if(city){
    city.name = this.form.controls['name'].value
    city.lat = +this.form.controls['lat'].value 
    city.lon = +this.form.controls['lon'].value
    city.pop = +this.form.controls['pop'].value
    city.countryId = +this.form.controls['countryId'].value

    if(this.id){
     //EDIT MODE 
  this.cityService.put(city).subscribe({
       next: (result) =>{
          this.toastr.info("City Updated Successfully")
             // go back to cities view 
         this.router.navigate(['/cities'])
       },
       error: (err) => console.log(err)
     })

    }
    else{
      //ADD NEW MODE
      this.cityService.post(city).subscribe({
        next: (result) => {
          this.toastr.success("City Inserted SuccessFully")
          //back to cities
          this.router.navigate(['/cities'])
        },
        error:(err) => console.log(err)
      })

    }

  } 
}

ondelete(){
        // retrieve the ID from the 'id' parameter 
  var idParam = this.activatedRoute.snapshot.paramMap.get('id')
  var id = idParam ? +idParam : 0
  
  if(confirm("Are you sure to delete this city")){

    this.cityService.delete(id).subscribe({
      next: () => {
        this.toastr.error("City Deleted Successfully")
        this.router.navigate(['/cities']) 
      },
      error: (err) => console.log(err)
    })
  }
}

isDupeCity(): AsyncValidatorFn {
  return (control: AbstractControl): Observable<{ [key: string]: any } | null> => {

    var city = <City>{};
    city.id = (this.id) ? this.id : 0;
    city.name = this.form.controls['name'].value; 
    city.lat = +this.form.controls['lat'].value;
    city.lon = +this.form.controls['lon'].value;
    city.countryId = +this.form.controls['countryId'].value;

   return this.cityService.isDupeCity(city).pipe(map(result => {

      return (result ? { isDupeCity: true } : null);
    }));
  }
}
}

