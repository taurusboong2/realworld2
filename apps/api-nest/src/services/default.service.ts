import { Injectable } from '@nestjs/common';
import { DefaultResponseDto } from '../dto/default/default-response.dto';

@Injectable()
export class DefaultService {
  hello() {
    return DefaultResponseDto.hello();
  }
}
