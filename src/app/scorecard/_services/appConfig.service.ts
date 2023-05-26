import { ScorecardHttpService } from './scorecardHttp.service';
import { Injectable } from '@angular/core';
import { AppConfig } from '../_models/appConfig';

@Injectable()
export class AppConfigService {
    private appConfig: AppConfig;

    constructor (private scorecardHttpService: ScorecardHttpService) {}

    loadAppConfig() {

      this.scorecardHttpService.getAppConfig().subscribe({

        next: (data) => this.appConfig = data,
        error: () => this.appConfig = {wsEndpoint: "dgng.pl/websocket/onlinescorecard?token="},

      })
    }

    get config() {
        return this.appConfig;
    }
}