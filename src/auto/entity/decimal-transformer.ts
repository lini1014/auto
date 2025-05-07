import Decimal from 'decimal.js';
import { type ValueTransformer } from 'typeorm';

export class DecimalTransformer implements ValueTransformer {
    /**
     * Transformation beim Schreiben in die DB
     */
    to(decimal?: Decimal): string | undefined {
        return decimal?.toString();
    }

    /**
     * Transformation beim Lesen aus der DB
     */
    from(decimal?: string): Decimal | undefined {
        return decimal === undefined ? undefined : Decimal(decimal);
    }
}
