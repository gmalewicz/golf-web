import { ModuleWithProviders } from '@angular/core';
import { AuthGuard } from '@/_helpers';

import { Routes, RouterModule } from '@angular/router';
import { CyclesModule } from './cycles.module';
import { CyclesComponent } from './cycles/cycles.component';
import { AddCycleComponent } from './add-cycle/add-cycle.component';
import { CycleDetailsComponent } from './cycle-details/cycle-details.component';

export const routs: Routes = [

  { path: '', component: CyclesComponent, canActivate: [AuthGuard] },
  { path: 'addCycle', component: AddCycleComponent, canActivate: [AuthGuard] },
  { path: 'cycleDetails', component: CycleDetailsComponent, canActivate: [AuthGuard] },

];

export const routing: ModuleWithProviders<CyclesModule> = RouterModule.forChild(routs);

