import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { WorkspaceController } from './workspace.controller';
import { WorkspaceRepository } from './workspace.repository';
import { WorkspaceService } from './workspace.service';

@Module({ imports: [DatabaseModule, NotificationsModule], controllers: [WorkspaceController], providers: [WorkspaceService, WorkspaceRepository], exports: [WorkspaceService, WorkspaceRepository] })
export class WorkspaceModule {}
