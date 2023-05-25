import { ScorecardHttpService } from './scorecardHttp.service';
import { Injectable } from '@angular/core';
import { tap } from 'rxjs';
import { AppConfig } from '../_models/appConfig';

@Injectable()
export class AppConfigService {
    private appConfig: AppConfig;

    constructor (private scorecardHttpService: ScorecardHttpService) {}

    loadAppConfig() {

        this.scorecardHttpService.getAppConfig().pipe(
          tap(
            (data: AppConfig)  => {
              this.appConfig = data;
            })
        ).subscribe();
    }

    get config() {
        return this.appConfig;
    }
}
