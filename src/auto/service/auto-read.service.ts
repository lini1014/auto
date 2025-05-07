/**
 * Das Modul besteht aus der Klasse {@linkcode AutoReadService}.
 * @packageDocumentation
 */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryBuilder } from './query-builder.js';
import { getLogger } from '../../logger/logger.js';
import { AutoFile } from '../entity/autoFile.entity.js';
import { Auto } from '../entity/auto.entity.js';
import { type Pageable } from './pageable.js';
import { type Slice } from './slice.js';
import { type Suchkriterien } from './suchkriterien.js';
import { Repository } from 'typeorm';

/**
 * Typ für findById
 */
export type FindByIdParams = {
    /** ID von Auto */
    readonly id: number;
    /** Mit Bilder laden? */
    readonly mitBilder?: boolean;
};

/**
 * Implementierung für das Lesesn für Autos und zugriff auf DB
 */
@Injectable()
export class AutoReadService {
    static readonly ID_PATTERN = /^[1-9]\d{0,10}$/u;

    readonly #autoProps: string[];

    readonly #queryBuilder: QueryBuilder;

    readonly #fileRepo: Repository<AutoFile>;

    readonly #logger = getLogger(AutoReadService.name);

    constructor(
        queryBuilder: QueryBuilder,
        @InjectRepository(AutoFile) fileRepo: Repository<AutoFile>,
    ) {
        const autoDummy = new Auto();
        this.#autoProps = Object.getOwnPropertyNames(autoDummy);
        this.#queryBuilder = queryBuilder;
        this.#fileRepo = fileRepo;
    }

    /**
     * Auto async suchen nach ID
     * @param id ID bon Auto
     * @returns gefundenes Auto
     * @throws NotFoundException bei fehler
     */
    async findById({
        id,
        mitBilder = false,
    }: FindByIdParams): Promise<Readonly<Auto>> {
        this.#logger.debug('findById: id=%d', id);

        //Lesen
        const auto = await this.#queryBuilder
            .buildId({ id, mitBilder })
            .getOne();
        if (auto === null) {
            throw new NotFoundException(`Es gibt kein Auto mit ID ${id}`);
        }
        if (auto.schlagwoerter === null) {
            auto.schlagwoerter = [];
        }

        if (this.#logger.isLevelEnabled('debug')) {
            this.#logger.debug(
                'findById: auto=%s, modell=%o',
                auto.toString(),
                auto.modell,
            );
            if (mitBilder) {
                this.#logger.debug('findById: bilder=%o', auto.bilder);
            }
        }
        return auto;
    }

    /**
     * Datei zu Auto suchen
     * @param autoId Id Auto
     * @returns Datei
     */
    async findFileByAutoId(
        autoId: number,
    ): Promise<Readonly<AutoFile> | undefined> {
        this.#logger.debug('findFileByAutoId: autoId=%s', autoId);
        const autoFile = await this.#fileRepo
            .createQueryBuilder('auto_file')
            .where('auto_id = :id', { id: autoId })
            .getOne();
        if (autoFile === null) {
            this.#logger.debug('findFileByAutoId: Keine Datei gefunden');
            return;
        }

        this.#logger.debug('findFileByAutoId: filename=%s', autoFile.filename);
        return autoFile;
    }

    /**
     * Autos async suchen
     * @param suchkriterien suchkriterium
     * @param pageable max anzahl seiten
     * @returns JSON array mit gefundenen autos
     * @throws NotFoundException bei fehler
     */
    async find(
        suchkriterien: Suchkriterien | undefined,
        pageable: Pageable,
    ): Promise<Slice<Auto>> {
        this.#logger.debug(
            'find: suchkriterien=%o, pageable=%o',
            suchkriterien,
            pageable,
        );

        // Keine Suchkriterien?
        if (suchkriterien === undefined) {
            return await this.#findAll(pageable);
        }
        const keys = Object.keys(suchkriterien);
        if (keys.length === 0) {
            return await this.#findAll(pageable);
        }

        // Falsche Namen fuer Suchkriterien?
        if (!this.#checkKeys(keys) || !this.#checkEnums(suchkriterien)) {
            throw new NotFoundException('Ungueltige Suchkriterien');
        }

        // QueryBuilder https://typeorm.io/select-query-builder
        // Das Resultat ist eine leere Liste, falls nichts gefunden
        // Lesen: Keine Transaktion erforderlich
        const queryBuilder = this.#queryBuilder.build(suchkriterien, pageable);
        const autos = await queryBuilder.getMany();
        if (autos.length === 0) {
            this.#logger.debug('find: Keine Autos gefunden');
            throw new NotFoundException(
                `Keine Autos gefunden: ${JSON.stringify(suchkriterien)}, Seite ${pageable.number}}`,
            );
        }
        const totalElements = await queryBuilder.getCount();
        return this.#createSlice(autos, totalElements);
    }
    async #findAll(pageable: Pageable) {
        const queryBuilder = this.#queryBuilder.build({}, pageable);
        const autos = await queryBuilder.getMany();
        if (autos.length === 0) {
            throw new NotFoundException(
                `Ungueltige Seite "${pageable.number}"`,
            );
        }
        const totalElements = await queryBuilder.getCount();
        return this.#createSlice(autos, totalElements);
    }

    #createSlice(autos: Auto[], totalElements: number) {
        autos.forEach((auto) => {
            if (auto.schlagwoerter === null) {
                auto.schlagwoerter = [];
            }
        });
        const autoSlice: Slice<Auto> = {
            content: autos,
            totalElements,
        };
        this.#logger.debug('createSlice: autoSlice=%o', autoSlice);
        return autoSlice;
    }

    #checkKeys(keys: string[]) {
        this.#logger.debug('#checkKeys: keys=%s', keys);
        // Ist jedes Suchkriterium auch eine Property von Auto oder "schlagwoerter"?
        let validKeys = true;
        keys.forEach((key) => {
            if (
                !this.#autoProps.includes(key) &&
                key !== 'sport' &&
                key !== 'komfort' &&
                key !== 'limo'
            ) {
                this.#logger.debug(
                    '#checkKeys: ungueltiges Suchkriterium "%s"',
                    key,
                );
                validKeys = false;
            }
        });

        return validKeys;
    }

    #checkEnums(suchkriterien: Suchkriterien) {
        const { art } = suchkriterien;
        this.#logger.debug('#checkEnums: Suchkriterium "art=%s"', art);
        return (
            art === undefined ||
            art === 'COUPE' ||
            art === 'LIMO' ||
            art === 'KOMBI'
        );
    }
}
