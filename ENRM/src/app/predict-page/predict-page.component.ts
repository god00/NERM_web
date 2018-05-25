import { Component, OnInit, OnDestroy } from '@angular/core';
import { FileUploader, FileItem } from 'ng2-file-upload';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MatTableDataSource } from '@angular/material';

import { AppComponent } from '../app.component';
import { appConfig } from '../app.config';

import NERMModel from '../models/nerm.model';
import { DatabaseService } from '../services/database.service';

const nermUrl = `${appConfig.apiUrl}/api/nerms/uploads`;

@Component({
  selector: 'app-predict-page',
  templateUrl: './predict-page.component.html',
  styleUrls: ['./predict-page.component.css']
})
export class PredictPageComponent implements OnInit, OnDestroy {
  user: any;
  projectsByUser: NERMModel[] = [];
  projectName: string = "DefaultModel";
  modelName: string = "Default";
  predictData = [];
  predictDataId: any;
  predicting: boolean;
  output: any = [];

  getTestDataSubscribe: any;
  predictModelSubscribe: any;
  predictDataIntervalId: any;

  //Predict table
  displayedColumnsPredict = ["Word", "Prediction"];
  predictTable: any = [];
  dataSourcePredict: any;

  // Upload parameter
  public uploader: FileUploader = new FileUploader({ url: nermUrl });
  hasError: boolean = false;

  constructor(
    private appComponent: AppComponent,
    private modalService: NgbModal,
    public databaseService: DatabaseService,
  ) { }

  ngOnInit() {
    this.user = JSON.parse(localStorage.getItem('currentUser'));
    this.projectsByUser = this.appComponent.projectsByUser;
    this.getPredictData();
    console.log(this.predicting)
  }

  ngOnDestroy() {
    if (this.getTestDataSubscribe) {
      this.getTestDataSubscribe.unsubscribe();
    }
    if (this.predictModelSubscribe) {
      this.predictModelSubscribe.unsubscribe();
    }
    if (this.predictDataIntervalId)
      clearInterval(this.predictDataIntervalId);
  }

  onSelect() {
    let target = document.getElementById('selectModel');
    this.projectName = target['selectedOptions'][0].parentNode.label;
    this.modelName = target['value'];
    this.getPredictData();
  }

  predictModel() {
    this.predicting = true;
    this.predictModelSubscribe = this.databaseService.predictModel(this.user['email'], encodeURI(<string>this.projectName), encodeURI(<string>this.modelName)).subscribe((res) => {
      if (res) {
        this.setIntervalPredictData();
      }
    })
  }

  setIntervalPredictData() {
    if (this.predicting) {
      if (this.predictDataIntervalId)
        clearInterval(this.predictDataIntervalId);
      this.predictDataIntervalId = setInterval(() => {
        this.getPredictData().then(() => {
          if (!this.predicting) {
            if (this.predictDataIntervalId)
              clearInterval(this.predictDataIntervalId);
          }
        });
      }, 3500)
    }
  }

  uploadModal(content, mode) {
    let count = 0;
    this.uploader = new FileUploader({ url: nermUrl });
    this.uploader.onBuildItemForm = (fileItem, form) => {
      form.append('email', this.user['email']);
      form.append('projectName', this.projectName);
      form.append('mode', mode);
      form.append('modelname', this.modelName);
      return { fileItem, form }
    };
    this.uploader.onSuccessItem = (item: any, response: any, status: any, headers: any) => {
      count = 0;
      this.hasError = item.isError;
      this.getPredictData();
    };
    this.uploader.onErrorItem = (item: any, response: any, status: any, headers: any) => {
      // console.log("fail:", item, status);
      if (count == 0) {
        this.uploader.uploadItem(item);
        count++;
      }
      this.hasError = item.isError;
    };
    this.modalService.open(content, { centered: true, size: 'lg' });
  }

  getPredictData() {
    return new Promise((resolve, reject) => {
      if (this.getTestDataSubscribe)
        this.getTestDataSubscribe.unsubscribe();

      this.getTestDataSubscribe = this.databaseService.getTestData(this.user['email'], encodeURI(<string>this.projectName), this.modelName).subscribe(async (data) => {
        if (data) {
          console.log(data)
          this.predictData = data['testData'];
          this.predictDataId = data['id'];
          this.predicting = data['testing'];
          if (data['predict']) {
            this.output = data['predict'].data.split('\n');
            this.insertDataTable()
            // this.output.splice(-1, 1)
            // this.insertDataTable();
          }
        }
        else {
          console.log('No Test Data');
        }
        resolve();
      })
    })
  }

  insertDataTable() {
    if (this.predictTable.length != 0)
      this.predictTable = []
    this.output.forEach((row) => {
      let arrColumn = row.split('\t');
      let dataObject = {};
      dataObject['Word'] = arrColumn[0];
      dataObject['Prediction'] = arrColumn[-1];
      this.predictTable.push(dataObject);
    });
    this.dataSourcePredict = new MatTableDataSource(this.predictTable);
  }

  deletePredictData(fileName: string) {
    this.databaseService.deleteTestData(this.predictDataId, fileName).subscribe((res) => {
      if (res) {
        this.predictData = res.testData;
      }
      else {
        console.log('ERROR: please try again!');
      }
    })
  }



}
