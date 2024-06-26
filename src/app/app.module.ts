import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MatInputModule } from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatSnackBarModule} from '@angular/material/snack-bar';

import 'chartjs-adapter-moment';
import 'chartjs-plugin-annotation';

import {MatFormFieldModule} from '@angular/material/form-field';
import { FormsModule } from '@angular/forms'; 
import { ReactiveFormsModule } from '@angular/forms';
import {MatTooltipModule} from '@angular/material/tooltip';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgChartsModule } from 'ng2-charts';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { ChartComponent } from './chart/chart.component';
import {MatSelectModule} from '@angular/material/select';
import { ImportantDatesComponent } from './important-dates/important-dates.component';
import { MatTableModule } from '@angular/material/table';
import {MatExpansionModule} from '@angular/material/expansion';


@NgModule({
  declarations: [
    AppComponent,
    ChartComponent,
    ImportantDatesComponent
  ],
  imports: [
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule,
    FormsModule,
    MatButtonModule,
    MatCheckboxModule,
    ReactiveFormsModule,
    BrowserModule,
    MatTableModule,
    AppRoutingModule,
    MatExpansionModule,
    NgChartsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatFormFieldModule,
    MatTooltipModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
