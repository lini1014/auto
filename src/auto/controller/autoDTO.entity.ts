/**
 * Das Modul besteht aus der Entity-Klasse.
 * @packageDocumentation
 */
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
    ArrayUnique,
    IsArray,
    IsBoolean,
    IsISO8601,
    IsOptional,
    Matches,
    Validate,
    ValidateNested,
    type ValidationArguments,
    ValidatorConstraint,
    type ValidatorConstraintInterface,
} from 'class-validator';
import Decimal from 'decimal.js';
import { type AutoArt } from '../entity/auto.entity.js';
import { BildDTO } from './bildDTO.entity.js';
import { ModellDTO } from './modellDTO.entity.js';

export const MAX_RATING = 5;

const number2Decimal = ({ value }: { value: Decimal.Value | undefined }) => {
    if (value === undefined) {
        return;
    }

    Decimal.set({ precision: 6 });
    return Decimal(value);
};

const number2Percent = ({ value }: { value: Decimal.Value | undefined }) => {
    if (value === undefined) {
        return;
    }

    Decimal.set({ precision: 4 });
    return Decimal(value);
};

@ValidatorConstraint({ name: 'decimalMin', async: false })
class DecimalMin implements ValidatorConstraintInterface {
    validate(value: Decimal | undefined, args: ValidationArguments) {
        if (value === undefined) {
            return true;
        }
        const [minValue]: Decimal[] = args.constraints;
        return value.greaterThanOrEqualTo(minValue!);
    }

    defaultMessage(args: ValidationArguments) {
        return `Der Wert muss groesser oder gleich ${(args.constraints[0] as Decimal).toNumber()} sein.`;
    }
}

@ValidatorConstraint({ name: 'decimalMax', async: false })
class DecimalMax implements ValidatorConstraintInterface {
    validate(value: Decimal | undefined, args: ValidationArguments) {
        if (value === undefined) {
            return true;
        }
        const [maxValue]: Decimal[] = args.constraints;
        return value.lessThanOrEqualTo(maxValue!);
    }

    defaultMessage(args: ValidationArguments) {
        return `Der Wert muss kleiner oder gleich ${(args.constraints[0] as Decimal).toNumber()} sein.`;
    }
}

/**
 * Entity-Klasse für Autos
 */
export class AutoDtoOhneRef {
    @Matches(/^\d-\d{4}-\d$/)
    @ApiProperty({ example: '1-2345-6', type: String })
    readonly fgnr!: string;

    @Matches(/^(COUPE|LIMO|KOMBI)$/u)
    @IsOptional()
    @ApiProperty({ example: 'COUPE', type: String })
    readonly art: AutoArt | undefined;

    @Transform(number2Decimal)
    @Validate(DecimalMin, [Decimal(0)], {
        message: 'preis muss positiv sein.',
    })
    @ApiProperty({ example: 1, type: Number })
    readonly preis!: Decimal;

    @Transform(number2Percent)
    @Validate(DecimalMin, [Decimal(0)], {
        message: 'rabatt muss positiv sein.',
    })
    @Validate(DecimalMax, [Decimal(1)], {
        message: 'rabatt muss kleiner 1 sein.',
    })
    @IsOptional()
    @ApiProperty({ example: 0.1, type: Number })
    readonly rabatt: Decimal | undefined;

    @IsBoolean()
    @IsOptional()
    @ApiProperty({ example: true, type: Boolean })
    readonly lieferbar: boolean | undefined;

    @IsISO8601({ strict: true })
    @IsOptional()
    @ApiProperty({ example: '2021-01-31' })
    readonly datum: Date | string | undefined;

    @IsOptional()
    @ArrayUnique()
    @ApiProperty({ example: ['SPORT', 'KOMFORT', 'LIMO'] })
    readonly schlagwoerter: string[] | undefined;
}

/**
 * Entity-Klasse für Autos ohne TypeORM.
 */
export class AutoDTO extends AutoDtoOhneRef {
    @ValidateNested()
    @Type(() => ModellDTO)
    @ApiProperty({ type: ModellDTO })
    readonly modell!: ModellDTO; // NOSONAR

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => BildDTO)
    @ApiProperty({ type: [BildDTO] })
    readonly bilder: BildDTO[] | undefined;
}
