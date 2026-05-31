export class TagResponseDto {
  tags: string[];

  static fromTagNames(tags: string[]): TagResponseDto {
    return { tags };
  }
}
