import { Races, RaceOrder, ElementDemons } from './constants';
import { FissionTable, FusionTable, ElementTable } from '../../compendium/models';
import { SmtFusionChart } from '../../compendium/models/smt-fusion-chart';

import * as FUSION_CHART_JSON from '../data/fusion-chart.json';
import * as ELEMENT_MODIFIERS_JSON from '../data/element-modifiers.json';

export class FusionChart extends SmtFusionChart {
  lvlModifier = 0;
  elementDemons = ElementDemons;

  protected fissionChart: FissionTable;
  protected fusionChart: FusionTable;
  protected elementChart: ElementTable;

  constructor() {
    super();
    this.initCharts();
  }

  initCharts() {
    this.fissionChart = {};
    this.fusionChart = {};
    this.elementChart = {};

    for (const race of Races) {
      this.fissionChart[race] = {};
      this.fusionChart[race] = {};
      this.elementChart[race] = {};
    }

    for (const elem of this.elementDemons) {
      this.fissionChart[elem] = {};
    }

    for (let i = 0; i < Races.length; i++) {
      const raceA = Races[i];
      const raceRs = FUSION_CHART_JSON[i];

      for (let j = i + 1; j < Races.length; j++) {
        const raceB = Races[j];
        const raceR = raceRs[j];

        if (RaceOrder.hasOwnProperty(raceR)) {
          if (!this.fissionChart[raceR][raceA]) {
            this.fissionChart[raceR][raceA] = [];
          }

          this.fusionChart[raceA][raceB] = raceR;
          this.fusionChart[raceB][raceA] = raceR;
          this.fissionChart[raceR][raceA].push(raceB);
        }
      }
    }

    for (const [race, json] of Object.entries(ELEMENT_MODIFIERS_JSON)) {
      for (const [elem, modifier] of Object.entries(json)) {
        this.elementChart[race][elem] = modifier;
      }
    }
  }
}
