import { ApiProperty } from '@nestjs/swagger';
import { MaxLength } from 'class-validator';

/**
 * Entity-Klasse für Bild ohne TypeORM.
 */
export class BildDTO {
    @MaxLength(32)
    @ApiProperty({ example: 'Die Beschriftung', type: String })
    readonly beschriftung!: string;

    @MaxLength(16)
    @ApiProperty({ example: 'image/png', type: String })
    readonly contentType!: string;
}
