import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EnglishService } from './english.service';
import { CreateEnglishDto } from './dto/create-english.dto';
import { UpdateEnglishDto } from './dto/update-english.dto';

@Controller('english')
export class EnglishController {
  constructor(private readonly englishService: EnglishService) {}

  // @Post()
  // create(@Body() createEnglishDto: CreateEnglishDto) {
  //   return this.englishService.create(createEnglishDto);
  // }

  // @Get()
  // findAll() {
  //   return this.englishService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.englishService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateEnglishDto: UpdateEnglishDto) {
  //   return this.englishService.update(+id, updateEnglishDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.englishService.remove(+id);
  // }

  @Get('proxy-get-quote')
  proxyGetQuotesEveryday() {
    return this.englishService.proxyGetQuotesEveryday();
  }

  @Post('translate')
  proxyTranslateWord(@Body() body: any) {
    return this.englishService.proxyTranslateWord(body.word);
  }

  @Get('quote')
  getQuoteHomePage() {
    return this.englishService.getQuoteHomePage();
  }

  @Post('new-word')
  addNewWord(@Body() body: any) {
    return this.englishService.addNewWord(body.word);
  }

  @Get('word')
  getWord(@Param('word') word: string) {
    return this.englishService.getWordDefinition(word);
  }

  @Get('list-words')
  getListWords() {
    return this.englishService.getListWords();
  }
}
