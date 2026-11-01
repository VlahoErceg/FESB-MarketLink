import { IsString, IsNotEmpty, IsNumber, IsInt, IsOptional, Min } from 'class-validator';

export class CreateListingDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  description: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsInt()
  categoryId: number;

  @IsString()
  location: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}
