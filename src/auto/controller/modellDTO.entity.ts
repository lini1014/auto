/**
 * Das Modul besteht aus der Entity-Klasse.
 * @packageDocumentation
 */

import { ApiProperty } from '@nestjs/swagger';
import { Matches, MaxLength } from 'class-validator';

/**
 * Entity-Klasse für Modell ohne TypeORM.
 */
export class ModellDTO {
    @Matches(String.raw`^\w.*`)
    @MaxLength(40)
    @ApiProperty({ example: 'Der Modell', type: String })
    readonly modell!: string;
}
/* eslint-enable @typescript-eslint/no-magic-numbers */
