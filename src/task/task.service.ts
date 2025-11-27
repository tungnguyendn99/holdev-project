import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';

import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CronJob } from 'cron';
import moment from 'moment';
import { AxiosRequestConfig } from 'axios';
import { HttpService } from '@nestjs/axios';
import { QUOTES_COLLECTION_NAME } from '../english/schemas/constants';
import { EnglishService } from '../english/english.service';

@Injectable()
export class TaskService {
  private readonly logger = new Logger(TaskService.name);

  constructor(private readonly englishService: EnglishService) {}

  // @Cron(CronExpression.EVERY_DAY_AT_5AM)
  // async sendNotifChiDinhToPatient() {
  //   return this.englishService.proxyGetQuotesEveryday();
  // }
}
