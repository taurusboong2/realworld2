export class DefaultResponseDto {
  message: string;

  static hello(): DefaultResponseDto {
    return { message: 'Hello World!' };
  }
}
