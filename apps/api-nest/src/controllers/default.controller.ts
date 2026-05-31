import { Controller, Get } from '@nestjs/common';
import { DefaultService } from '../services/default.service';

@Controller('/api')
export class DefaultController {
  constructor(private readonly defaultService: DefaultService) {}

  @Get('/')
  getFoo() {
    return this.defaultService.hello();
  }
}
