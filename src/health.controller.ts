import { Controller, Get } from '@nestjs/common';
import { Public } from './common/decorators/Public.decorator';

@Controller('health')
export class HealthController {
  @Public()
  @Get()
  getHealth() {
    return {
      status: 'ok',
      service: 'nestjs-api',
      timestamp: new Date().toISOString(),
    };
  }
}
