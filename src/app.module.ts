import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { appConfig } from './common/config/app.config';
import { UserModule } from './lib/User/infrastructure/NestJs/user.module';
import { TeamModule } from './lib/Team/infrastructure/NestJs/team.module';
import { ScoreModule } from './lib/Score/infrastructure/NestJs/score.module';
import { PlanningModule } from './lib/Planning/infrastructure/NestJs/planning.module';
import { MatchSumoModule } from './lib/MatchSumo/infrastructure/NestJs/match-sumo.module';
import { ClassementModule } from './lib/Classement/infrastructure/NestJs/classement.module';
import { SupabaseModule } from './common/supabase/supabase.module';
import { HealthController } from './health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    SupabaseModule,
    UserModule,
    TeamModule,
    ScoreModule,
    PlanningModule,
    MatchSumoModule,
    ClassementModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
