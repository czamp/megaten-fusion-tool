import { Component, ChangeDetectionStrategy, Input, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { Subscription } from 'rxjs/Subscription';

import { DemonEntryContainerComponent as DECC } from '../../compendium/containers/demon-entry.component';

import { BaseStats, ResistanceElements, ElementOrder, InheritElements, APP_TITLE } from '../models/constants';
import { Demon } from '../models';
import { Compendium } from '../models/compendium';

import { CurrentDemonService } from '../../compendium/current-demon.service';
import { FusionDataService } from '../fusion-data.service';

@Component({
  selector: 'app-demon-entry',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-container *ngIf="demon">
      <app-demon-stats
        [title]="'Lvl ' + demon.lvl + ' ' + demon.race + ' ' + demon.name"
        [price]="demon.price"
        [statHeaders]="statHeaders"
        [stats]="demon.stats">
      </app-demon-stats>
      <app-demon-resists
        [resistHeaders]="resistHeaders"
        [resists]="demon.resists">
      </app-demon-resists>
      <app-demon-inherits
        [hasIcons]="false"
        [inheritHeaders]="inheritHeaders"
        [inherits]="demon.inherits">
      </app-demon-inherits>
      <app-demon-skills
        [hasTarget]="true"
        [hasRank]="true"
        [elemOrder]="elemOrder"
        [compendium]="compendium"
        [skillLevels]="demon.skills">
      </app-demon-skills>
      <app-smt-fusions [showFusionAlert]="isCursed">
        Cursed fusion enabled (More reverse fusions for Vile, Wilder, Night, and Haunt demons)
      </app-smt-fusions>
    </ng-container>
    <ng-container *ngIf="!demon">
      <table>
        <thead>
          <tr><th>Entry for {{ name }}</th></tr>
        </thead>
        <tbody>
          <tr><td>Error: Could not find entry in compendium for {{ name }}</td></tr>
        </tbody>
      </table>
    </ng-container>
  `
})
export class DemonEntryComponent {
  @Input() name: string;
  @Input() demon: Demon;
  @Input() compendium: Compendium;
  @Input() isCursed = false;

  statHeaders = BaseStats;
  elemOrder = ElementOrder;
  resistHeaders = ResistanceElements;
  inheritHeaders = InheritElements;
}

@Component({
  selector: 'app-demon-entry-container',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-demon-entry [name]="name" [demon]="demon" [compendium]="compendium" [isCursed]="isCursed"></app-demon-entry>
  `
})
export class DemonEntryContainerComponent extends DECC {
  appName = APP_TITLE;
  isCursed = false;

  constructor(
    private route: ActivatedRoute,
    private title: Title,
    private currentDemonService: CurrentDemonService,
    private fusionDataService: FusionDataService
  ) {
    super(route, title, currentDemonService, fusionDataService);
  }

  subscribeAll() {
    super.subscribeAll();

    this.subscriptions.push(
      this.fusionDataService.fusionChart.subscribe(chart => {
        this.isCursed = chart.isCursed;
      }));
  }
}
