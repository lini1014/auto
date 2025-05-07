import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailModule } from '../mail/mail.module.js';
import { KeycloakModule } from '../security/keycloak/keycloak.module.js';
import { AutoGetController } from './controller/auto-get.controller.js';
import { AutoWriteController } from './controller/auto-write.controller.js';
import { entities } from './entity/entities.js';
import { AutoMutationResolver } from './resolver/auto-mutation.resolver.js';
import { AutoQueryResolver } from './resolver/auto-query.resolver.js';
import { AutoReadService } from './service/auto-read.service.js';
import { AutoWriteService } from './service/auto-write.service.js';
import { QueryBuilder } from './service/query-builder.js';

/**
 * Das Modul besteht aus Controller- und Service-Klassen für die Verwaltung von
 * Bücher.
 * @packageDocumentation
 */
@Module({
    imports: [KeycloakModule, MailModule, TypeOrmModule.forFeature(entities)],
    controllers: [AutoGetController, AutoWriteController],
    providers: [
        AutoReadService,
        AutoWriteService,
        AutoQueryResolver,
        AutoMutationResolver,
        QueryBuilder,
    ],
    exports: [AutoReadService, AutoWriteService],
})
export class AutoModule {}
