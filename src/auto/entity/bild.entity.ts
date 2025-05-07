import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { Auto } from './auto.entity.js';

@Entity()
export class Bild {
    @PrimaryGeneratedColumn()
    id: number | undefined;

    @Column('varchar')
    readonly beschriftung: string | undefined;

    @Column('varchar')
    readonly contentType: string | undefined;

    @ManyToOne(() => Auto, (auto) => auto.bilder)
    @JoinColumn({ name: 'auto_id' })
    auto: Auto | undefined;

    public toString = (): string =>
        JSON.stringify({
            id: this.id,
            beschriftung: this.beschriftung,
            contentType: this.contentType,
        });
}
