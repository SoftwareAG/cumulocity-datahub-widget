import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { FetchClient } from '@c8y/ngx-components/api';
import { IFetchOptions } from '@c8y/client';

@Injectable()
export class QueryService {
  private readonly dataHubDremioApi = '/service/datahub/dremio/api/v3';

  private fetchOptions: IFetchOptions = {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  };

  constructor(private http: HttpClient, private fetchClient: FetchClient) { }

  async getJobState(jobId) {
    const response = await this.fetchClient.fetch(this.dataHubDremioApi + '/job/' + jobId, this.fetchOptions);
    if (response.status >= 200 && response.status < 300) {
      return response.json();
    } else {
      throw new Error(await response.text());
    }
  }

  async getJobResults(jobId) {
    const response = await this.fetchClient.fetch(this.dataHubDremioApi + '/job/' + jobId + '/results', this.fetchOptions)
    if (response.status >= 200 && response.status < 300) {
      return response.json();
    } else {
      throw new Error(await response.text());
    }
  }

  async postQuery(query: String): Promise<any> {
    const response = await this.fetchClient.fetch(this.dataHubDremioApi + '/sql', { ...this.fetchOptions, method: 'POST', body: query })
    if (response.status >= 200 && response.status < 300) {
      return response.json();
    } else {
      throw new Error(await response.text());
    }
  }
}