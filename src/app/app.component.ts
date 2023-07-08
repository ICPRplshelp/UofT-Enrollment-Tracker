import { Component, HostListener } from '@angular/core';
import { ChartOptions, ChartDataset, ChartType } from 'chart.js';
import { Course, ImportantTimestamps, Meeting } from './cinterfaces';
import { CrsgetterService } from './crsgetter.service';
import * as pluginAnnotation from 'chartjs-plugin-annotation';
import { MatSnackBar, MatSnackBarRef } from '@angular/material/snack-bar';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
}
