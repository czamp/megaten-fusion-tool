import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Title } from '@angular/platform-browser';

import { DemonListContainerComponent as DLCC } from '../../compendium/containers/demon-list.component';
import { RaceOrder, ElementOrder, BaseStats, ResistanceElements, APP_TITLE } from '../constants';
import { FusionDataService } from '../fusion-data.service';

@Component({
  selector: 'app-demon-list-container',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-smt-demon-list
      [raceOrder]="raceOrder"
      [inheritOrder]="inheritOrder"
      [statHeaders]="statHeaders"
      [resistHeaders]="resistHeaders"
      [rowData]="demons | async">
    </app-smt-demon-list>
  `
})
export class DemonListContainerComponent extends DLCC {
  appName = `List of Demons - ${APP_TITLE}`;
  raceOrder = RaceOrder;
  statHeaders = BaseStats;
  inheritOrder = ElementOrder;
  resistHeaders = ResistanceElements;
  defaultSortFun = (d1, d2) => (RaceOrder[d1.race] - RaceOrder[d2.race]) * 200 + d2.lvl - d1.lvl;

  constructor(
    title: Title,
    changeDetectorRef: ChangeDetectorRef,
    fusionDataService: FusionDataService
  ) { super(title, changeDetectorRef, fusionDataService); }
}
