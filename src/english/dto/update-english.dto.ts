import { PartialType } from '@nestjs/mapped-types';
import { CreateEnglishDto } from './create-english.dto';

export class UpdateEnglishDto extends PartialType(CreateEnglishDto) {}
