import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { appConfig } from './common/config/app.config';
import { UserModule } from './lib/User/infrastructure/NestJs/user.module';
import { SupabaseModule } from './common/supabase/supabase.module';
import { HealthController } from './health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
    }),
    SupabaseModule,
    UserModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
