/*
* Copyright (c) 2020 Software AG, Darmstadt, Germany and/or its licensors
*
* SPDX-License-Identifier: Apache-2.0
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
 */

import {Component, Input, OnDestroy} from '@angular/core';
import {BehaviorSubject, from, Subscription} from "rxjs";
import {delay, distinctUntilChanged, retryWhen, switchMap} from "rxjs/operators";
import {IDatahubWidgetConfig} from "./datahub-widget-config.component";
import {QueryService} from "./query.service";

@Component({
    templateUrl: './datahub-widget.component.html',
    styles: [ `.text { transform: scaleX(-1); font-size: 3em ;}` ]
})
export class DatahubWidgetComponent implements OnDestroy {
    _config: IDatahubWidgetConfig = {
        queryString: '',
        tablePath: '',
        refreshPeriod: 60000,
        columns: []
    };

    @Input() set config(config: IDatahubWidgetConfig) {
        this._config = Object.assign(config, {
            ...this._config,
            ...config
        });
        this.querySubject.next(this.config.queryString);
        this.visibleColumns = this.config.columns.filter(col => col.visibility == 'visible') as {
            colName: string,
            displayName: string,
            visibility: 'visible'
        }[];
    };
    get config(): IDatahubWidgetConfig {
        return this._config
    }

    subscriptions = new Subscription();
    querySubject = new BehaviorSubject<undefined | string>(undefined);

    visibleColumns: {
        colName: string,
        displayName: string,
        visibility: 'visible'
    }[];
    rows: string[];

    constructor(private queryService: QueryService) {
        this.subscriptions.add(
            this.querySubject
                .pipe(
                    distinctUntilChanged(),
                    switchMap(query => from(this.queryService.queryForResults(query, {timeout: this.config.refreshPeriod}))),
                    retryWhen(e => e.pipe(delay(this.config.refreshPeriod)))
                )
                .subscribe(results => {
                    this.rows = results.rows
                })
        );
    }

    ngOnDestroy() {
        this.subscriptions.unsubscribe();
    }
}