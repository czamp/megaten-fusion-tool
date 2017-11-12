import {
  FusionChart,
  FissionTable,
  FusionTable,
  ElementTable,
  FissionRow,
  FusionRow,
  ElementRow,
  ElemModifiers
} from '../models';

export abstract class SmtFusionChart implements FusionChart {
  protected abstract fissionChart: FissionTable;
  protected abstract fusionChart: FusionTable;
  protected abstract elementChart: ElementTable;

  abstract lvlModifier: number;
  abstract elementDemons: string[];

  static loadFusionTableJson(races: string[], table: string[][]): FusionTable {
    const fusionTable: FusionTable = {};

    for (const race of races) {
      fusionTable[race] = {};
    }

    for (let r = 0; r < table.length; r++) {
      const raceA = races[r];
      const row = table[r];
      const cOffset = races.length - row.length;

      for (let c = 0; c < row.length; c++) {
        const raceB = races[c + cOffset];
        const raceR = row[c];

        if (raceR !== '-') {
          fusionTable[raceA][raceB] = raceR;
          fusionTable[raceB][raceA] = raceR;
        }
      }
    }

    return fusionTable;
  }

  static loadFissionTableJson(races: string[], elems: string[], table: string[][]): FissionTable {
    const fissionTable: FissionTable = {};

    for (const race of races) {
      fissionTable[race] = {};
    }

    for (const elem of elems) {
      fissionTable[elem] = {};
    }

    for (let r = 0; r < table.length; r++) {
      const raceA = races[r];
      const row = table[r];
      const cOffset = races.length - row.length;

      for (let c = 0; c < row.length; c++) {
        const raceB = races[c + cOffset];
        const raceR = row[c];

        if (raceR !== '-') {
          if (!fissionTable[raceR][raceA]) {
            fissionTable[raceR][raceA] = [];
          }

          fissionTable[raceR][raceA].push(raceB);
        }
      }
    }

    return fissionTable;
  }

  static loadElementTableJson(races: string[], elems: string[], table: number[][]): ElementTable {
    const elementTable: ElementTable = {};

    for (const race of races) {
      elementTable[race] = {};
    }

    for (let r = 0; r < table.length; r++) {
      const race = races[r];
      const row = table[r];

      for (let c = 0; c < row.length; c++) {
        const elem = elems[c];

        elementTable[race][elem] = table[r][c];
      }
    }

    return elementTable;
  }

  static loadFissionChart(races: string[], elems: string[], fusionJson: any): FissionTable {
    const chart: FissionTable = {};

    for (const race of races) {
      chart[race] = {};
    }

    for (const elem of elems) {
      chart[elem] = {};
    }

    for (const [raceA, raceBs] of Object.entries(fusionJson)) {
      for (const [raceB, raceR] of Object.entries(raceBs)) {
        if (!chart[raceR][raceA]) {
          chart[raceR][raceA] = [];
        }

        chart[raceR][raceA].push(raceB);
      }
    }

    return chart;
  }

  static loadFusionChart(races: string[], fusionJson: any): FusionTable {
    const chart: FusionTable = {};

    for (const race of races) {
      chart[race] = {};
    }

    for (const [raceA, raceBs] of Object.entries(fusionJson)) {
      for (const [raceB, raceR] of Object.entries(raceBs)) {
        chart[raceA][raceB] = raceR;
        chart[raceB][raceA] = raceR;
      }
    }

    return chart;
  }

  getRaceFissions(race: string): FissionRow {
    return this.fissionChart[race] || {};
  }

  getRaceFusions(race: string): FusionRow {
    return this.fusionChart[race] || {};
  }

  getRaceFusion(raceA: string, raceB: string): string {
    return this.fusionChart[raceA][raceB];
  }

  getElemModifiers(race: string): ElemModifiers {
    const modifiers: ElemModifiers = {};

    if (this.elementChart.hasOwnProperty(race)) {
      for (const [elem, mod] of Object.entries(this.elementChart[race])) {
        if (!modifiers[mod]) {
          modifiers[mod] = [];
        }

        modifiers[mod].push(elem);
      }
    }

    return modifiers;
  }

  getElemFusions(elem: string): ElementRow {
    const combos = {};

    for (const [race, row] of Object.entries(this.elementChart)) {
      if (row[elem]) {
        combos[race] = row[elem];
      }
    }

    return combos;
  }

  isConvertedRace(race: string): boolean {
    return false;
  }
}