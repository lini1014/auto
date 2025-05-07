import { type AutoArt } from '../entity/auto.entity.js';

export interface Suchkriterien {
    readonly fgnr?: string;
    readonly art?: AutoArt | undefined;
    readonly preis?: number;
    readonly rabatt?: number;
    readonly lieferbar?: boolean;
    readonly datum?: string;
    readonly sport?: string;
    readonly gelaende?: string;
    readonly komfort?: string;
    readonly python?: string;
    readonly modell?: string;
}
