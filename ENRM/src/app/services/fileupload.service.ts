import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

import { appConfig } from '../app.config';

import { FileUploader, FileItem, ParsedResponseHeaders } from 'ng2-file-upload';

// const URL = '/api/';
const nermUrl = `${appConfig.apiUrl}/api/nerms/uploads`;

@Injectable()
export class FileUploadService {
    uploader: FileUploader = new FileUploader({ url: nermUrl });

    constructor(private http: HttpClient) {
    }

}