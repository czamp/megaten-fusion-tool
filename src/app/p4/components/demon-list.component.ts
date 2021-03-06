import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { RaceOrder, ElementOrder, BaseStats, ResistElements } from '../constants';

import { DemonListContainerComponent as DLCC } from '../../compendium/containers/demon-list.component';
import { FusionDataService } from '../fusion-data.service';

@Component({
  selector: 'app-demon-list-container',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-smt-demon-list
      [isEnemy]="showEnemies"
      [raceOrder]="raceOrder"
      [inheritOrder]="inheritOrder"
      [statHeaders]="statHeaders"
      [resistHeaders]="resistHeaders"
      [rowData]="demons | async">
    </app-smt-demon-list>
  `
})
export class DemonListContainerComponent extends DLCC {
  raceOrder = RaceOrder;
  inheritOrder = ElementOrder;
  statHeaders = BaseStats;
  resistHeaders = ResistElements;
  defaultSortFun = (d1, d2) => (RaceOrder[d1.race] - RaceOrder[d2.race]) * 200 + d2.lvl - d1.lvl;

  constructor(
    title: Title,
    route: ActivatedRoute,
    changeDetectorRef: ChangeDetectorRef,
    fusionDataService: FusionDataService
  ) {
    super(title, changeDetectorRef, fusionDataService);
    this.appName = `List of Personas - ${fusionDataService.appName}`;
    this.showAllies = !route.snapshot.data.showShadows;
    this.showEnemies = !this.showAllies;

    if (this.showEnemies) {
      this.appName = `List of Shadows - ${fusionDataService.appName}`;
      this.inheritOrder = null;
      this.statHeaders = ['HP', 'MP'];
      this.resistHeaders = ResistElements.concat(['almighty']);
    }
  }
}
