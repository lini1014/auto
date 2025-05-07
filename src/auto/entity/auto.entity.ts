import { ApiProperty } from '@nestjs/swagger';
import {
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
    VersionColumn,
} from 'typeorm';
import Decimal from 'decimal.js';

import { DecimalTransformer } from './decimal-transformer.js';
import { Modell } from './modell.entity.js';
import { AutoFile } from './autoFile.entity.js';
import { dbType } from '../../config/db.js';
import { Bild } from './bild.entity.js';

/**
 * Typen für strings bei der Art eines Autos.
 */
export type AutoArt = 'COUPE' | 'LIMO' | 'KOMBI';

/**
 * Entity Klasse Auto.
 */
@Entity()
export class Auto {
    @PrimaryGeneratedColumn()
    id: number | undefined;

    @VersionColumn()
    readonly version: number | undefined;

    @Column('varchar')
    @ApiProperty({ example: '1-1234-1', type: Number })
    readonly fgnr: string | undefined;

    @Column('varchar')
    @ApiProperty({ example: 'COUPE', type: String })
    readonly art: AutoArt | undefined;

    //Rundungsfehler vermeiden für TypeORM
    @Column('decimal', {
        precision: 8,
        scale: 2,
        transformer: new DecimalTransformer(),
    })
    @ApiProperty({ example: 3999, type: Number })
    readonly preis: Decimal | undefined;

    @Column('decimal', {
        precision: 4,
        scale: 3,
        transformer: new DecimalTransformer(),
    })
    @ApiProperty({ example: 0.9, type: Number })
    readonly rabatt: Decimal | undefined;

    @Column('decimal')
    @ApiProperty({ example: true, type: Boolean })
    readonly lieferbar: boolean | undefined;

    @Column('date')
    @ApiProperty({ example: 2020 - 11 - 12 })
    readonly datum: Date | string | undefined;

    @Column('simple-array')
    schlagwoerter: string[] | null | undefined;

    //HIER KOMMEN DANN DB RELATIONEN NOCH REIN
    @OneToOne(() => Modell, (modell) => modell.auto, {
        cascade: ['insert', 'remove'],
    })
    readonly modell: Modell | undefined;

    // undefined wegen Updates
    @OneToMany(() => Bild, (bild) => bild.auto, {
        cascade: ['insert', 'remove'],
    })
    readonly bilder: Bild[] | undefined;

    @OneToOne(() => AutoFile, (autoFile) => autoFile.auto, {
        cascade: ['insert', 'remove'],
    })
    readonly file: AutoFile | undefined;

    @CreateDateColumn({
        type: dbType === 'sqlite' ? 'datetime' : 'timestamp',
    })
    readonly erzeugt: Date | undefined;

    @UpdateDateColumn({
        type: dbType === 'sqlite' ? 'datetime' : 'timestamp',
    })
    readonly aktualisiert: Date | undefined;

    public toString = (): string =>
        JSON.stringify({
            id: this.id,
            version: this.version,
            fgnr: this.fgnr,
            art: this.art,
            preis: this.preis,
            rabatt: this.rabatt,
            lieferbar: this.lieferbar,
            datum: this.datum,
            schlagwoerter: this.schlagwoerter,
            erzeugt: this.erzeugt,
            aktualisiert: this.aktualisiert,
        });
}
