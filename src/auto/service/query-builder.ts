// Copyright (C) 2016 - present Juergen Zimmermann, Hochschule Karlsruhe
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program. If not, see <https://www.gnu.org/licenses/>.

/**
 * Das Modul besteht aus der Klasse {@linkcode QueryBuilder}.
 * @packageDocumentation
 */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { typeOrmModuleOptions } from '../../config/typeormOptions.js';
import { getLogger } from '../../logger/logger.js';
import { Bild } from '../entity/bild.entity.js';
import { Auto } from '../entity/auto.entity.js';
import { DEFAULT_PAGE_NUMBER, DEFAULT_PAGE_SIZE } from './pageable.js';
import { type Pageable } from './pageable.js';
import { Modell } from '../entity/modell.entity.js';
import { type Suchkriterien } from './suchkriterien.js';

/** Typdefinitionen für die Suche mit der Auto-ID. */
export type BuildIdParams = {
    /** ID des gesuchten Autos. */
    readonly id: number;
    /** Sollen die Bilder mitgeladen werden? */
    readonly mitBilder?: boolean;
};
/**
 * Die Klasse `QueryBuilder` implementiert das Lesen für Bücher und greift
 * mit _TypeORM_ auf eine relationale DB zu.
 */
@Injectable()
export class QueryBuilder {
    readonly #autoAlias = `${Auto.name
        .charAt(0)
        .toLowerCase()}${Auto.name.slice(1)}`;

    readonly #modellAlias = `${Modell.name
        .charAt(0)
        .toLowerCase()}${Modell.name.slice(1)}`;

    readonly #bildAlias = `${Bild.name
        .charAt(0)
        .toLowerCase()}${Bild.name.slice(1)}`;

    readonly #repo: Repository<Auto>;

    readonly #logger = getLogger(QueryBuilder.name);

    constructor(@InjectRepository(Auto) repo: Repository<Auto>) {
        this.#repo = repo;
    }

    /**
     * Ein Auto mit der ID suchen.
     * @param id ID des gesuchten Autoes
     * @returns QueryBuilder
     */
    buildId({ id, mitBilder = false }: BuildIdParams) {
        // QueryBuilder "auto" fuer Repository<Auto>
        const queryBuilder = this.#repo.createQueryBuilder(this.#autoAlias);

        // Fetch-Join: aus QueryBuilder "auto" die Property "modell" ->  Tabelle "modell"
        queryBuilder.innerJoinAndSelect(
            `${this.#autoAlias}.modell`,
            this.#modellAlias,
        );

        if (mitBilder) {
            // Fetch-Join: aus QueryBuilder "auto" die Property "bilden" -> Tabelle "bild"
            queryBuilder.leftJoinAndSelect(
                `${this.#autoAlias}.bilder`,
                this.#bildAlias,
            );
        }

        queryBuilder.where(`${this.#autoAlias}.id = :id`, { id: id }); // eslint-disable-line object-shorthand
        return queryBuilder;
    }

    /**
     * Bücher asynchron suchen.
     * @param suchkriterien JSON-Objekt mit Suchkriterien. Bei "modell" wird mit
     * mit der Obergrenze.
     * @param pageable Maximale Anzahl an Datensätzen und Seitennummer.
     * @returns QueryBuilder
     */
    // z.B. { modell: 'a', preis: 22.5, gelaende: true }
    // "rest properties" fuer anfaengliche WHERE-Klausel: ab ES 2018 https://github.com/tc39/proposal-object-rest-spread
    // eslint-disable-next-line max-lines-per-function, prettier/prettier, sonarjs/cognitive-complexity
    build(
        {
            // NOSONAR
            modell,
            preis,
            gelaende,
            sport,
            komfort,
            python,
            ...restProps
        }: Suchkriterien,
        pageable: Pageable,
    ) {
        this.#logger.debug(
            'build: modell=%s, preis=%s, gelaende=%s, sport=%s, komfort=%s, python=%s, restProps=%o, pageable=%o',
            modell,
            preis,
            gelaende,
            sport,
            komfort,
            python,
            restProps,
            pageable,
        );

        let queryBuilder = this.#repo.createQueryBuilder(this.#autoAlias);
        queryBuilder.innerJoinAndSelect(`${this.#autoAlias}.modell`, 'modell');

        // z.B. { modell: 'a', gelaende: true }
        // "rest properties" fuer anfaengliche WHERE-Klausel: ab ES 2018 https://github.com/tc39/proposal-object-rest-spread
        // type-coverage:ignore-next-line
        // const { modell, gelaende, sport, ...otherProps } = suchkriterien;

        let useWhere = true;

        // Modell in der Query: Teilstring des Modells und "case insensitive"
        // CAVEAT: MySQL hat keinen Vergleich mit "case insensitive"
        // type-coverage:ignore-next-line
        if (modell !== undefined && typeof modell === 'string') {
            const ilike =
                typeOrmModuleOptions.type === 'postgres' ? 'ilike' : 'like';
            queryBuilder = queryBuilder.where(
                `${this.#modellAlias}.modell ${ilike} :modell`,
                { modell: `%${modell}%` },
            );
            useWhere = false;
        }

        if (preis !== undefined && typeof preis === 'string') {
            const preisNumber = Number(preis);
            queryBuilder = queryBuilder.where(
                `${this.#autoAlias}.preis <= ${preisNumber}`,
            );
            useWhere = false;
        }

        if (gelaende === 'true') {
            queryBuilder = useWhere
                ? queryBuilder.where(
                      `${this.#autoAlias}.schlagwoerter like '%GELAENDE%'`,
                  )
                : queryBuilder.andWhere(
                      `${this.#autoAlias}.schlagwoerter like '%GELAENDE%'`,
                  );
            useWhere = false;
        }

        if (sport === 'true') {
            queryBuilder = useWhere
                ? queryBuilder.where(
                      `${this.#autoAlias}.schlagwoerter like '%SPORT%'`,
                  )
                : queryBuilder.andWhere(
                      `${this.#autoAlias}.schlagwoerter like '%SPORT%'`,
                  );
            useWhere = false;
        }

        // Bei "KOMFORT" sollen Ergebnisse mit "GELAENDE" _nicht_ angezeigt werden
        if (komfort === 'true') {
            queryBuilder = useWhere
                ? queryBuilder.where(
                      `REPLACE(${this.#autoAlias}.schlagwoerter, 'GELAENDE', '') like '%KOMFORT%'`,
                  )
                : queryBuilder.andWhere(
                      `REPLACE(${this.#autoAlias}.schlagwoerter, 'GELAENDE', '') like '%KOMFORT%'`,
                  );
            useWhere = false;
        }

        if (python === 'true') {
            queryBuilder = useWhere
                ? queryBuilder.where(
                      `${this.#autoAlias}.schlagwoerter like '%PYTHON%'`,
                  )
                : queryBuilder.andWhere(
                      `${this.#autoAlias}.schlagwoerter like '%PYTHON%'`,
                  );
            useWhere = false;
        }

        // Restliche Properties als Key-Value-Paare: Vergleiche auf Gleichheit
        Object.entries(restProps).forEach(([key, value]) => {
            const param: Record<string, any> = {};
            param[key] = value; // eslint-disable-line security/detect-object-injection
            queryBuilder = useWhere
                ? queryBuilder.where(
                      `${this.#autoAlias}.${key} = :${key}`,
                      param,
                  )
                : queryBuilder.andWhere(
                      `${this.#autoAlias}.${key} = :${key}`,
                      param,
                  );
            useWhere = false;
        });

        this.#logger.debug('build: sql=%s', queryBuilder.getSql());

        if (pageable?.size === 0) {
            return queryBuilder;
        }
        const size = pageable?.size ?? DEFAULT_PAGE_SIZE;
        const number = pageable?.number ?? DEFAULT_PAGE_NUMBER;
        const skip = number * size;
        this.#logger.debug('take=%s, skip=%s', size, skip);
        return queryBuilder.take(size).skip(skip);
    }
}
