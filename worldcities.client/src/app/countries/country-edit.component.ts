import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl, AsyncValidatorFn } from '@angular/forms';
import { Country } from './country';
import { ActivatedRoute,  Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseFormComponent } from '../base-form.component';
import { CountryService } from '../Services/country.service';

@Component({
  selector: 'app-country-edit',
  templateUrl: './country-edit.component.html',
  styleUrl: './country-edit.component.scss'
})
export class CountryEditComponent extends BaseFormComponent implements OnInit{

  title?:string
  country?:Country
  id?:number
  countries?:Country[]

  constructor(private fb: FormBuilder,
              private activatedRoute: ActivatedRoute,
              private router: Router,
              private countryService: CountryService ){
                super()
              }

 
      ngOnInit() {
        this.form = this.fb.group({
          name:[
            '',
            Validators.required,
            this.isDupeField("name")
          ],
          iso2:[
            '',
            [
            Validators.required,
            Validators.pattern(/^[a-zA-Z]{2}$/)
            ],
            this.isDupeField("iso2"),
          ],
          iso3:[
            '',
            [
              Validators.required,
              Validators.pattern(/^[a-zA-Z]{3}$/)
            ],
            this.isDupeField("iso3")
          ]
        })
        this.loadData()
      }

      loadData(){

        // retrieve the ID from the 'id' parameter
          var idParm = this.activatedRoute.snapshot.paramMap.get('id')
          this.id = idParm? +idParm : 0

          if(this.id){
     //Edit Mode

     // fetch the country from the server 
          this.countryService.get(this.id).subscribe({
            next: (result) =>{
              this.country = result
              this.title = "Edit -" + this.country.name

              //udate the form with country value
              this.form.patchValue(this.country)
            },
            error: (err) => console.log(err)
          })
          }
         else{
          //Add New Country

          this.title = "Create a New Country"
         } 

      }
   
       onSubmit(){
        var country = (this.id)? this.country : <Country>{}
        if(country){
              country.name = this.form.controls['name'].value
              country.iso2 = this.form.controls['iso2'].value
              country.iso3 = this.form.controls['iso3'].value

            if(this.id){
              //Edit Mode
              this.countryService.put(country).subscribe({
                  next: (result) => {
                      console.log("Country " + country!.id + " Has been updated");
                      this.router.navigate(['/countries'])
                  },
                  error: (err) => console.log(err)
                })
           
            }
            else{
              //Add New Mode
              this.countryService.post(country).subscribe({
                          next: (result) => {
                                console.log("Country " + result.id + " Has Been Created");
                            this.router.navigate(['/countreis'])
                          },
                          error: (err) => console.log(err)
                        })
            }
          }
       }

       isDupeField(fieldName: string): AsyncValidatorFn {
        return (control: AbstractControl): Observable<{
          [key: string]: any
        } | null> => {

        return this.countryService.isDupeField(this.id?? 0,fieldName,control.value)  .pipe(map(result => {
              return (result ? { isDupeField: true } : null);
            }));
        }
      }


}
