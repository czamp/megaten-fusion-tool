import { ElementOrder, Races, ResistCodes } from '../constants';
import { Demon, Skill } from '../models';
import { Demon as BaseDemon, Compendium as ICompendium, NamePair } from '../../compendium/models';

import * as SPECIAL_RECIPES_JSON from '../data/special-recipes.json';
import * as INHERITANCE_TYPES from '../data/inheritance-types.json';

export class Compendium implements ICompendium {
  private demons: { [name: string]: Demon };
  private enemies: { [name: string]: BaseDemon };
  private skills: { [name: string]: Skill };
  private specialRecipes: { [name: string]: string[] } = {};
  private invertedDemons: { [race: string]: { [lvl: number]: string } };

  private allIngredients: { [race: string]: number[] };
  private allResults: { [race: string]: number[] };
  private _allDemons: BaseDemon[];
  private _allSkills: Skill[];
  private _inheritTypes: { [inherti: string]: number[] };

  dlcDemons: { [name: string]: boolean } = {};

  constructor(demonDataJsons: any[], enemyDataJsons: any[], skillDataJsons: any[]) {
    this.initImportedData(demonDataJsons, enemyDataJsons, skillDataJsons);
    this.updateDerivedData();
  }

  initImportedData(demonDataJsons: any[], enemyDataJsons: any[], skillDataJsons: any[]) {
    const demons:   { [name: string]: Demon } = {};
    const enemies:  { [name: string]: BaseDemon } = {};
    const skills:   { [name: string]: Skill } = {};
    const specials: { [name: string]: string[] } = {};
    const inverses: { [race: string]: { [lvl: number]: string } } = {};
    this._inheritTypes = {};

    for (const demonDataJson of demonDataJsons) {
      for (const [name, json] of Object.entries(demonDataJson)) {
        demons[name] = {
          name,
          race:    json.race,
          lvl:     json.lvl,
          price:   Math.pow(json.stats.reduce((acc, stat) => stat + acc, 0), 2) + 2000,
          inherit: json.inherits,
          stats:   json.stats,
          resists: json.resists.split('').map(char => ResistCodes[char]),
          skills:  json.skills,
          fusion:  'normal'
        };
      }
    }

    for (const enemyDataJson of enemyDataJsons) {
      for (const [name, enemy] of Object.entries(enemyDataJson)) {
        let drops = []
        
        if (enemy.material && enemy.material !== '-') {
          drops.push(enemy.material);
        } if (enemy.gem && enemy.gem !== '-') {
          drops.push(enemy.gem);
        } if (enemy.drops) {
          drops = drops.concat(enemy.drops);
        } if (!drops.length) {
          drops.push('-');
        }

        enemies[name] = {
          name,
          race:    enemy.race,
          lvl:     enemy.lvl,
          price:   0,
          stats:   enemy.stats.slice(0, 2),
          estats:  enemy.stats.slice(2),
          resists: enemy.resists.toLowerCase().split('').map(char => ResistCodes[char]),
          skills:  enemy.skills.reduce((acc, s) => { acc[s] = 0; return acc; }, {}),
          fusion:  'normal',
          area:    enemy.area,
          drop:    drops.join(', '),
          isEnemy: true
        };
      }
    }

    for (const skillData of skillDataJsons) {
      for (const [name, json] of Object.entries(skillData)) {
        skills[name] = {
          name,
          element:   json.element,
          cost:      json.cost ? json.cost : 0,
          rank:      json.cost ? json.cost / 100 : 0,
          effect:    json.effect,
          learnedBy: [],
          fuse:      json.card ? json.card.split(', ') : [],
          level:     0
        };

        if (json.unique) {
          skills[name].rank = 99;
        }
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

    for (let i = 0; i < INHERITANCE_TYPES['inherits'].length; i++) {
      this._inheritTypes[INHERITANCE_TYPES['inherits'][i]] = INHERITANCE_TYPES['ratios'][i];
    }

    this.demons = demons;
    this.enemies = enemies;
    this.skills = skills;
    this.specialRecipes = specials;
    this.invertedDemons = inverses;
  }

  updateDerivedData() {
    const ingredients: { [race: string]: number[] } = {};
    const results:     { [race: string]: number[] } = {};

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

    const allies = Object.keys(this.demons).map(name => this.demons[name]);
    const enemies = Object.keys(this.enemies).map(name => this.enemies[name]);
    this._allDemons = enemies.concat(allies);
    this._allSkills = Object.keys(this.skills).map(name => this.skills[name]);
    this.allIngredients = ingredients;
    this.allResults = results;
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

  get inheritHeaders(): string[] {
    return INHERITANCE_TYPES['elems'];
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

  getInheritElems(inheritType: string): number[] {
    return this._inheritTypes[inheritType];
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
