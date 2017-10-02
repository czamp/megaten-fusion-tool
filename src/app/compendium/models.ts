import { Observable } from 'rxjs/Observable';

export interface CompendiumConfig {
  raceOrder: { [race: string]: number };
  reverseFuse(demon: string, compendium: any, fusionChart: any): { type: string, data: FusionRow[] };
  forwardFuse(demon: string, compendium: any, fusionChart: any): FusionRow[];
}

export interface FusionTableHeaders {
  left: string;
  right: string;
}

export interface Demon {
  race: string;
  lvl: number;
  name: string;
  stats: number[];
  resists: string[];
  fusion: string;
}

export interface Skill {
  element: string;
  name: string;
  cost: number;
  effect: string;
  level: number;
}

export interface FusionRecipe {
  name1: string;
  name2: string;
}

export interface FusionRow {
  race1: string;
  lvl1: number;
  name1: string;
  race2: string;
  lvl2: number;
  name2: string;
  notes?: string;
}

export interface Compendium {
  getDemon(name: string): Demon;
  getAllDemons(): Demon[];
  getSkill(name: string): Skill;
  getAllSkills(): Skill[];
  getIngredientDemonLvls(race: string): number[];
  getResultDemonLvls(race: string): number[];
  reverseLookupDemon(race: string, lvl: number): string;
  isElementDemon(name: string): boolean;
}

export interface FusionChart {
  getReverseFusionCombos(race: string): { ingRace1: string; ingRace2: string; }[];
  getForwardFusionCombos(race: string): { ingRace2: string, resultRace: string }[];
  getFusionResultRace(ingRace1: string, ingRace2: string): string;
  getElementModifiers(race: string): { [offset: number]: string[] };
  getElementResults(element: string): { [race: string]: number };
}

export interface FusionDataService {
  compendium: Observable<Compendium>;
  fusionChart: Observable<FusionChart>;
}