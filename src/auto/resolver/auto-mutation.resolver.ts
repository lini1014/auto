import { UseFilters, UseGuards, UseInterceptors } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { IsInt, IsNumberString, Min } from 'class-validator';
import Decimal from 'decimal.js';
import { AuthGuard, Roles } from 'nest-keycloak-connect';
import { getLogger } from '../../logger/logger.js';
import { ResponseTimeInterceptor } from '../../logger/response-time.interceptor.js';
import { AutoDTO } from '../controller/autoDTO.entity.js';
import { type Bild } from '../entity/bild.entity.js';
import { type Auto } from '../entity/auto.entity.js';
import { type Modell } from '../entity/modell.entity.js';
import { AutoWriteService } from '../service/auto-write.service.js';
import { type IdInput } from './auto-query.resolver.js';
import { HttpExceptionFilter } from './http-exception.filter.js';

export type CreatePayload = {
    readonly id: number;
};

export type UpdatePayload = {
    readonly version: number;
};

export class AutoUpdateDTO extends AutoDTO {
    @IsNumberString()
    readonly id!: string;

    @IsInt()
    @Min(0)
    readonly version!: number;
}
@Resolver('Auto')
@UseGuards(AuthGuard)
@UseFilters(HttpExceptionFilter)
@UseInterceptors(ResponseTimeInterceptor)
export class AutoMutationResolver {
    readonly #service: AutoWriteService;

    readonly #logger = getLogger(AutoMutationResolver.name);

    constructor(service: AutoWriteService) {
        this.#service = service;
    }

    @Mutation()
    @Roles('admin', 'user')
    async create(@Args('input') autoDTO: AutoDTO) {
        this.#logger.debug('create: autoDTO=%o', autoDTO);

        const auto = this.#autoDtoToAuto(autoDTO);
        const id = await this.#service.create(auto);
        this.#logger.debug('createAuto: id=%d', id);
        const payload: CreatePayload = { id };
        return payload;
    }

    @Mutation()
    @Roles('admin', 'user')
    async update(@Args('input') autoDTO: AutoUpdateDTO) {
        this.#logger.debug('update: auto=%o', autoDTO);

        const auto = this.#autoUpdateDtoToAuto(autoDTO);
        const versionStr = `"${autoDTO.version.toString()}"`;

        const versionResult = await this.#service.update({
            id: Number.parseInt(autoDTO.id, 10),
            auto,
            version: versionStr,
        });
        // TODO BadUserInputError
        this.#logger.debug('updateAuto: versionResult=%d', versionResult);
        const payload: UpdatePayload = { version: versionResult };
        return payload;
    }

    @Mutation()
    @Roles('admin')
    async delete(@Args() id: IdInput) {
        const idStr = id.id;
        this.#logger.debug('delete: id=%s', idStr);
        const deletePerformed = await this.#service.delete(idStr);
        this.#logger.debug('deleteAuto: deletePerformed=%s', deletePerformed);
        return deletePerformed;
    }

    #autoDtoToAuto(autoDTO: AutoDTO): Auto {
        const modellDTO = autoDTO.modell;
        const modell: Modell = {
            id: undefined,
            modell: modellDTO.modell,
            auto: undefined,
        };
        const bilder = autoDTO.bilder?.map((bildDTO) => {
            const bild: Bild = {
                id: undefined,
                beschriftung: bildDTO.beschriftung,
                contentType: bildDTO.contentType,
                auto: undefined,
            };
            return bild;
        });
        const auto: Auto = {
            id: undefined,
            version: undefined,
            fgnr: autoDTO.fgnr,
            art: autoDTO.art,
            preis: Decimal(autoDTO.preis),
            rabatt: Decimal(autoDTO.rabatt ?? ''),
            lieferbar: autoDTO.lieferbar,
            datum: autoDTO.datum,
            schlagwoerter: autoDTO.schlagwoerter,
            modell,
            bilder,
            file: undefined,
            erzeugt: new Date(),
            aktualisiert: new Date(),
        };

        // Rueckwaertsverweis
        auto.modell!.auto = auto;
        return auto;
    }

    #autoUpdateDtoToAuto(autoDTO: AutoUpdateDTO): Auto {
        return {
            id: undefined,
            version: undefined,
            fgnr: autoDTO.fgnr,
            art: autoDTO.art,
            preis: Decimal(autoDTO.preis),
            rabatt: Decimal(autoDTO.rabatt ?? ''),
            lieferbar: autoDTO.lieferbar,
            datum: autoDTO.datum,
            schlagwoerter: autoDTO.schlagwoerter,
            modell: undefined,
            bilder: undefined,
            file: undefined,
            erzeugt: undefined,
            aktualisiert: new Date(),
        };
    }
}
