import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './home.component';

const appRoutes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'smt3', loadChildren: './smt3/compendium.module#CompendiumModule' },
  { path: 'smtsj', loadChildren: './smtsj/compendium.module#CompendiumModule' },
  { path: 'smt4', loadChildren: './smt4/compendium.module#CompendiumModule' },
  { path: 'smt4f', loadChildren: './smt4f/compendium.module#CompendiumModule' },
  { path: 'p3', loadChildren: './p3/compendium.module#CompendiumModule' },
  { path: 'p5', loadChildren: './p5/compendium.module#CompendiumModule' },
  { path: 'desu1', loadChildren: './desu1/compendium.module#CompendiumModule' },
  { path: 'desu2', loadChildren: './desu2/compendium.module#CompendiumModule' },
  { path: '**', redirectTo: 'home', pathMatch: 'full' }
];

@NgModule({
  imports: [ RouterModule.forRoot(appRoutes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule { }
