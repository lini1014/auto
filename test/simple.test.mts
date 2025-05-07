import { describe, test, expect } from 'vitest';

describe('simple', () => {
    test('true === true', () => {
        expect(true).toBe(true);
    });

    test.todo('noch nicht fertig', () => {
        expect(true).toBe(false);
    });
});
