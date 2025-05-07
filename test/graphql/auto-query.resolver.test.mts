/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { type GraphQLRequest } from '@apollo/server';
import { beforeAll, describe, expect, test } from 'vitest';
import { HttpStatus } from '@nestjs/common';
import axios, { type AxiosInstance, type AxiosResponse } from 'axios';
import { type Auto, type AutoArt } from '../../src/auto/entity/auto.entity.js';
import { type GraphQLResponseBody } from './graphql.mjs';
import { baseURL, httpsAgent } from '../constants.mjs';

type AutoDTO = Omit<Auto, 'bilder' | 'aktualisiert' | 'erzeugt' | 'rabatt'> & {
    rabatt: string;
};

const idVorhanden = '60';

const modellVorhanden = 'AUDI';
const teilModellVorhanden = 'm';
const teilModellNichtVorhanden = 'abc';

const fgnrVorhanden = '1-0001-6';

describe('GraphQL Queries', () => {
    let client: AxiosInstance;
    const graphqlPath = 'graphql';

    beforeAll(async () => {
        const baseUrlGraphQL = `${baseURL}/`;
        client = axios.create({
            baseURL: baseUrlGraphQL,
            httpsAgent,
            validateStatus: () => true,
        });
    });

    test.concurrent('Auto zu vorhandener ID', async () => {
        const body: GraphQLRequest = {
            query: `
                {
                    auto(id: "${idVorhanden}") {
                        version
                        fgnr
                        art
                        preis
                        lieferbar
                        datum
                        schlagwoerter
                        modell {
                            modell
                        }
                        rabatt(short: true)
                    }
                }
            `,
        };

        // when
        const { status, headers, data }: AxiosResponse<GraphQLResponseBody> =
            await client.post(graphqlPath, body);

        // then
        expect(status).toBe(HttpStatus.OK);
        expect(headers['content-type']).toMatch(/json/iu);
        expect(data.errors).toBeUndefined();
        expect(data.data).toBeDefined();

        const { auto } = data.data! as { auto: AutoDTO };

        expect(auto.modell?.modell).toMatch(/^\w/u);
        expect(auto.version).toBeGreaterThan(-1);
        expect(auto.id).toBeUndefined();
    });

    test.concurrent('Auto zu nicht-vorhandener ID', async () => {
        // given
        const id = '999999';
        const body: GraphQLRequest = {
            query: `
                {
                    auto(id: "${id}") {
                        modell {
                            modell
                        }
                    }
                }
            `,
        };

        // when
        const { status, headers, data }: AxiosResponse<GraphQLResponseBody> =
            await client.post(graphqlPath, body);

        // then
        expect(status).toBe(HttpStatus.OK);
        expect(headers['content-type']).toMatch(/json/iu);
        expect(data.data!.auto).toBeNull();

        const { errors } = data;

        expect(errors).toHaveLength(1);

        const [error] = errors!;
        const { message, path, extensions } = error;

        expect(message).toBe(`Es gibt kein Auto mit ID ${id}`);
        expect(path).toBeDefined();
        expect(path![0]).toBe('auto');
        expect(extensions).toBeDefined();
        expect(extensions!.code).toBe('BAD_USER_INPUT');
    });

    test.concurrent('Auto zu vorhandenem Modell', async () => {
        // given
        const body: GraphQLRequest = {
            query: `
                {
                    autos(suchkriterien: {
                        modell: "${modellVorhanden}"
                    }) {
                        art
                        modell {
                            modell
                        }
                    }
                }
            `,
        };

        // when
        const { status, headers, data }: AxiosResponse<GraphQLResponseBody> =
            await client.post(graphqlPath, body);

        // then
        expect(status).toBe(HttpStatus.OK);
        expect(headers['content-type']).toMatch(/json/iu);
        expect(data.errors).toBeUndefined();
        expect(data.data).toBeDefined();

        const { autos } = data.data! as { autos: AutoDTO[] };

        expect(autos).not.toHaveLength(0);
        expect(autos).toHaveLength(3);

        const [auto] = autos;

        expect(auto!.modell?.modell).toBe(modellVorhanden);
    });

    test.concurrent('Auto zu vorhandenem Teil-Modell', async () => {
        // given
        const body: GraphQLRequest = {
            query: `
                {
                    autos(suchkriterien: {
                        modell: "${teilModellVorhanden}"
                    }) {
                        modell {
                            modell
                        }
                    }
                }
            `,
        };

        // when
        const { status, headers, data }: AxiosResponse<GraphQLResponseBody> =
            await client.post(graphqlPath, body);

        // then
        expect(status).toBe(HttpStatus.OK);
        expect(headers['content-type']).toMatch(/json/iu);
        expect(data.errors).toBeUndefined();
        expect(data.data).toBeDefined();

        const { autos } = data.data! as { autos: AutoDTO[] };

        expect(autos).not.toHaveLength(0);

        autos
            .map((auto) => auto.modell)
            .forEach((modell) =>
                expect(modell?.modell?.toLowerCase()).toStrictEqual(
                    expect.stringContaining(teilModellVorhanden),
                ),
            );
    });

    test.concurrent('Auto zu nicht vorhandenem Modell', async () => {
        // given
        const body: GraphQLRequest = {
            query: `
                {
                    autos(suchkriterien: {
                        modell: "${teilModellNichtVorhanden}"
                    }) {
                        art
                        modell {
                            modell
                        }
                    }
                }
            `,
        };

        // when
        const { status, headers, data }: AxiosResponse<GraphQLResponseBody> =
            await client.post(graphqlPath, body);

        // then
        expect(status).toBe(HttpStatus.OK);
        expect(headers['content-type']).toMatch(/json/iu);
        expect(data.data!.autos).toBeNull();

        const { errors } = data;

        expect(errors).toHaveLength(1);

        const [error] = errors!;
        const { message, path, extensions } = error;

        expect(message).toMatch(/^Keine Autos gefunden:/u);
        expect(path).toBeDefined();
        expect(path![0]).toBe('autos');
        expect(extensions).toBeDefined();
        expect(extensions!.code).toBe('BAD_USER_INPUT');
    });

    test.concurrent('Auto zu vorhandener FGNR-Nummer', async () => {
        // given
        const body: GraphQLRequest = {
            query: `
                {
                    autos(suchkriterien: {
                        fgnr: "${fgnrVorhanden}"
                    }) {
                        fgnr
                        modell {
                            modell
                        }
                    }
                }
            `,
        };

        // when
        const { status, headers, data }: AxiosResponse<GraphQLResponseBody> =
            await client.post(graphqlPath, body);

        // then
        expect(status).toBe(HttpStatus.OK);
        expect(headers['content-type']).toMatch(/json/iu);
        expect(data.errors).toBeUndefined();
        expect(data.data).toBeDefined();

        const { autos } = data.data! as { autos: AutoDTO[] };

        expect(autos).not.toHaveLength(0);
        expect(autos).toHaveLength(1);

        const [auto] = autos;
        const { fgnr, modell } = auto!;

        expect(fgnr).toBe(fgnrVorhanden);
        expect(modell?.modell).toBeDefined();
    });

    test.concurrent('Autos zur Art "COUPE"', async () => {
        // given
        const autoArt: AutoArt = 'COUPE';
        const body: GraphQLRequest = {
            query: `
                {
                    autos(suchkriterien: {
                        art: ${autoArt}
                    }) {
                        art
                        modell {
                            modell
                        }
                    }
                }
            `,
        };

        // when
        const { status, headers, data }: AxiosResponse<GraphQLResponseBody> =
            await client.post(graphqlPath, body);

        // then
        expect(status).toBe(HttpStatus.OK);
        expect(headers['content-type']).toMatch(/json/iu);
        expect(data.errors).toBeUndefined();
        expect(data.data).toBeDefined();

        const { autos } = data.data! as { autos: AutoDTO[] };

        expect(autos).not.toHaveLength(0);

        autos.forEach((auto) => {
            const { art, modell } = auto;

            expect(art).toBe(autoArt);
            expect(modell?.modell).toBeDefined();
        });
    });

    test.concurrent('Autos zur einer ungueltigen Art', async () => {
        // given
        const autoArt = 'UNGUELTIG';
        const body: GraphQLRequest = {
            query: `
                {
                    autos(suchkriterien: {
                        art: ${autoArt}
                    }) {
                        modell {
                            modell
                        }
                    }
                }
            `,
        };

        // when
        const { status, headers, data }: AxiosResponse<GraphQLResponseBody> =
            await client.post(graphqlPath, body);

        // then
        expect(status).toBe(HttpStatus.BAD_REQUEST);
        expect(headers['content-type']).toMatch(/json/iu);
        expect(data.data).toBeUndefined();

        const { errors } = data;

        expect(errors).toHaveLength(1);

        const [error] = errors!;
        const { extensions } = error;

        expect(extensions).toBeDefined();
        expect(extensions!.code).toBe('GRAPHQL_VALIDATION_FAILED');
    });

    test.concurrent('Autos mit lieferbar=true', async () => {
        // given
        const body: GraphQLRequest = {
            query: `
                {
                    autos(suchkriterien: {
                        lieferbar: true
                    }) {
                        lieferbar
                        modell {
                            modell
                        }
                    }
                }
            `,
        };

        // when
        const { status, headers, data }: AxiosResponse<GraphQLResponseBody> =
            await client.post(graphqlPath, body);

        // then
        expect(status).toBe(HttpStatus.OK);
        expect(headers['content-type']).toMatch(/json/iu);
        expect(data.errors).toBeUndefined();
        expect(data.data).toBeDefined();

        const { autos } = data.data! as { autos: AutoDTO[] };

        expect(autos).not.toHaveLength(0);

        autos.forEach((auto) => {
            const { lieferbar, modell } = auto;

            expect(lieferbar).toBe(true);
            expect(modell?.modell).toBeDefined();
        });
    });
});

/* eslint-enable @typescript-eslint/no-non-null-assertion */
