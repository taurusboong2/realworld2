import { Injectable } from '@nestjs/common';

@Injectable()
export class DefaultService {
  hello() {
    return { message: 'Hello World!' };
  }
}
