import { ElementOrder, Races, ResistCodes } from '../constants';
import { Demon, Enemy, Skill } from '../models';
import { Demon as BaseDemon, Compendium as ICompendium, NamePair } from '../../compendium/models';

import * as ENEMY_DATA_JSON from '../data/enemy-data.json';
import * as SKILL_DATA_JSON from '../data/skill-data.json';
import * as SPECIAL_RECIPES_JSON from '../data/special-recipes.json';

export class Compendium implements ICompendium {
  private demons: { [name: string]: Demon };
  private enemies: { [name: string]: Enemy };
  private skills: { [name: string]: Skill };
  private specialRecipes: { [name: string]: string[] } = {};
  private invertedDemons: { [race: string]: { [lvl: number]: string } };

  private allIngredients: { [race: string]: number[] };
  private allResults: { [race: string]: number[] };
  private _allDemons: BaseDemon[];
  private _allSkills: Skill[];

  private _dlcDemons: { [name: string]: boolean } = {
    'Kaguya': true,
    'Orpheus Telos': true,
    'Thanatos': false,
    'Magatsu-Izanagi': false
  };

  constructor(demonDataJsons: any[]) {
    this.initImportedData(demonDataJsons);
    this.updateDerivedData();
  }

  initImportedData(demonDataJsons: any[]) {
    const demons:   { [name: string]: Demon } = {};
    const enemies:  { [name: string]: Enemy } = {};
    const skills:   { [name: string]: Skill } = {};
    const specials: { [name: string]: string[] } = {};
    const inverses: { [race: string]: { [lvl: number]: string } } = {};

    for (const demonDataJson of demonDataJsons) {
      for (const [name, json] of Object.entries(demonDataJson)) {
        demons[name] = {
          name,
          race:     json.race,
          lvl:      json.lvl,
          price:    json.price * 100,
          inherits: json.inherits.split('').map(char => char === 'o'),
          stats:    [json.hp, json.mp],
          resists:  json.resists ? json.split('').map(char => ResistCodes[char]) : [],
          skills:   json.skills,
          fusion:   'normal'
        };
      }
    }

    for (const [name, json] of Object.entries(ENEMY_DATA_JSON)) {
      enemies[name] = {
        name,
        race:     json.race,
        lvl:      json.lvl,
        price:    0,
        exp:      json.exp,
        stats:    json.stats.slice(0, 3),
        estats:   json.stats.slice(3),
        resists:  json.resists.split('').map(char => ResistCodes[char]),
        ailments: json.ailments.split('').map(char => ResistCodes[char]),
        skills:   json.skills.reduce((acc, s) => { acc[s] = 0; return acc; }, {}),
        area:     json.area,
        drop:     json.drops.join(', '),
        fusion:   'normal',
        isEnemy:   true
      }
    }

    for (const [name, json] of Object.entries(SKILL_DATA_JSON)) {
      skills[name] = {
        name,
        element:   json.element,
        cost:      json.cost ? json.cost : 0,
        rank:      json.cost ? json.cost / 100 : 0,
        effect:    json.effect,
        target:    json.target ? json.target : 'Self',
        learnedBy: [],
        fuse:      json.card ? json.card.split(', ') : [],
        level:     0
      };

      if (json.unique) {
        skills[name].rank = 99;
      }
    }

    for (const [name, json] of Object.entries(SPECIAL_RECIPES_JSON)) {
      specials[name] = json;
      demons[name].fusion = 'special';
    }

    for (const race of Races) {
      inverses[race] = {};
    }

    for (const [name, demon] of Object.entries(demons)) {
      inverses[demon.race][demon.lvl] = name;

      for (const [skill, level] of Object.entries(demon.skills)) {
        skills[skill].learnedBy.push({ demon: name, level });
      }
    }

    this.demons = demons;
    this.enemies = enemies;
    this.skills = skills;
    this.specialRecipes = specials;
    this.invertedDemons = inverses;
  }

  updateDerivedData() {
    const demonEntries = Object.assign({}, this.demons);
    const skills =       Object.keys(this.skills).map(name => this.skills[name]);
    const ingredients:   { [race: string]: number[] } = {};
    const results:       { [race: string]: number[] } = {};

    for (const race of Races) {
      ingredients[race] = [];
      results[race] = [];
    }

    for (const [name, demon] of Object.entries(this.demons)) {
      ingredients[demon.race].push(demon.lvl);

      if (!this.specialRecipes.hasOwnProperty(name)) {
        results[demon.race].push(demon.lvl);
      }
    }

    for (const race of Races) {
      ingredients[race].sort((a, b) => a - b);
      results[race].sort((a, b) => a - b);
    }

    for (const [names, included] of Object.entries(this._dlcDemons)) {
      for (const name of names.split(',')) {
        if (!included) {
          const { race, lvl } = this.demons[name];
          delete demonEntries[name];

          ingredients[race] = ingredients[race].filter(l => l !== lvl);
          results[race] = results[race].filter(l => l !== lvl);
        }

        this.demons[name].fusion = included ? 'normal' : 'excluded';
      }
    }

    const allies = Object.keys(demonEntries).map(name => <BaseDemon>demonEntries[name]);
    const enemies = Object.keys(this.enemies).map(name => <BaseDemon>this.enemies[name]);
    this._allDemons = enemies.concat(allies);
    this._allSkills = skills;
    this.allIngredients = ingredients;
    this.allResults = results;
  }

  get dlcDemons(): { [name: string]: boolean } {
    return this._dlcDemons;
  }

  set dlcDemons(dlcDemons: { [name: string]: boolean }) {
    this._dlcDemons = dlcDemons;
    this.updateDerivedData();
  }

  get allDemons(): BaseDemon[] {
    return this._allDemons;
  }

  get allSkills(): Skill[] {
    return this._allSkills;
  }

  get specialDemons(): Demon[] {
    return Object.keys(this.specialRecipes).map(name => this.demons[name]);
  }

  getDemon(name: string): BaseDemon {
    return this.demons[name] || this.enemies[name];
  }

  getSkill(name: string): Skill {
    return this.skills[name];
  }

  getSkills(names: string[]): Skill[] {
    const skills = names.map(name => this.skills[name]);
    skills.sort((d1, d2) => (ElementOrder[d1.element] - ElementOrder[d2.element]) * 10000 + d1.rank - d2.rank);
    return skills;
  }

  getIngredientDemonLvls(race: string): number[] {
    return this.allIngredients[race] || [];
  }

  getResultDemonLvls(race: string): number[] {
    return this.allResults[race] || [];
  }

  getSpecialNameEntries(name: string): string[] {
    return this.specialRecipes[name] || [];
  }

  getSpecialNamePairs(name: string): NamePair[] {
    return [];
  }

  reverseLookupDemon(race: string, lvl: number): string {
    return this.invertedDemons[race][lvl];
  }

  reverseLookupSpecial(ingredient: string): { result: string, recipe: string }[] {
    return [];
  }

  isElementDemon(name: string): boolean {
    return false;
  }
}
