import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Reflector } from '@nestjs/core';
import helmet from 'helmet';
import 'reflect-metadata';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/GlobalExceptionFilter';
import { SupabaseAuthGuard } from './common/guards/SupabaseAuthGuard';
import { PermissionsGuard } from './common/guards/PermissionsGuard';
import { SUPABASE_CLIENT } from './common/supabase/supabase.constants';
import { SupabaseClient } from '@supabase/supabase-js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());

  app.enableCors({
    origin: process.env.WEB_ORIGIN?.split(',') ?? true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const supabase = app.get<SupabaseClient>(SUPABASE_CLIENT);
  const reflector = app.get(Reflector);

  app.useGlobalGuards(
    new SupabaseAuthGuard(supabase, reflector),
    new PermissionsGuard(reflector),
  );
  app.useGlobalFilters(new GlobalExceptionFilter());

  app.setGlobalPrefix('api');
  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
