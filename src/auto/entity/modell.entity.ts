import {
    Column,
    Entity,
    JoinColumn,
    OneToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';

import { Auto } from './auto.entity.js';

@Entity()
export class Modell {
    @PrimaryGeneratedColumn()
    id: number | undefined;

    @Column('varchar')
    readonly modell: string | undefined;

    @OneToOne(() => Auto, (auto) => auto.modell)
    @JoinColumn({ name: 'auto_id' })
    auto: Auto | undefined;

    public toString = (): string =>
        JSON.stringify({
            id: this.id,
            modell: this.modell,
        });
}
