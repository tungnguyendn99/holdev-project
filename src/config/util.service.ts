import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { xorBy, keyBy, sortBy } from 'lodash';
import * as uuid from 'uuid';
import { HttpService } from '@nestjs/axios';
import * as moment from 'moment';

@Injectable()
export class UtilService {
  constructor(private readonly httpService: HttpService) {}

  getException = (err, response) => {
    let error = err.message;
    if (err.isAxiosError) {
      error = err.response?.data || {};
    }

    if (err instanceof HttpException) {
      error = this.getHttpResponse(err);
    }

    return new HttpException(
      {
        error,
        ...response,
      },
      error.code || HttpStatus.BAD_REQUEST,
    );
  };

  getHttpResponse = (ex: HttpException): any => {
    if (typeof ex.getResponse() === 'string') {
      return { message: ex.getResponse() as string };
    } else {
      return ex.getResponse();
    }
  };

  getRandomInt = (min: number, max: number): number => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
  };
  randomText(vLength = 16) {
    const alphabet = 'abcdefghijklmnopqrstuwxyzABCDEFGHIJKLMNOPQRSTUWXYZ0123456789';
    let pass = [];
    const alphaLength = alphabet.length - 1;
    for (let i = 0; i < vLength; i++) {
      const n = this.getRandomInt(0, alphaLength);
      pass = [...pass, alphabet[n]];
    }
    return pass.join('');
  }

  randomNumber(vLength = 4) {
    const alphabet = '0123456789';
    let pass = [];
    const alphaLength = alphabet.length - 1;
    for (let i = 0; i < vLength; i++) {
      const n = this.getRandomInt(0, alphaLength);
      pass = [...pass, alphabet[n]];
    }
    return pass.join('');
  }

  transformPhone(phone: string): string {
    return `${phone}`
      .replace(/^[+]84|^0/, '+84')
      .replace(/^9/, '+849')
      .replace(/^3/, '+843');
  }

  errorHandler(error: any): any {
    try {
      const { response } = error;
      if (response?.data || response?.config) {
        return {
          message: response?.message,
          data: response.data,
          config: {
            url: response?.url || '',
            method: response?.method || '',
            data: response?.data || '',
            headers: response?.headers || '',
          },
        };
      }
      return JSON.parse(JSON.stringify(error));
    } catch (error) {
      return {
        message: 'Không parse được Error',
      };
    }
  }

  errorToJson(error: any): any {
    try {
      const { response } = error;

      if (error.isAxiosError) {
        return {
          ...error.toJSON(),
          responseData: error.response?.data,
        };
      }

      return JSON.parse(JSON.stringify(error, Object.getOwnPropertyNames(error)));
    } catch (error) {
      return {
        message: 'Không parse được Error',
      };
    }
  }

  textMessageBooking(type: string): string {
    if (type === 'booking') {
      return 'Đặt khám thành công';
    } else {
      return 'Đã thanh toán';
    }
  }

  compareVersion(versionA: string, versionB: string): number {
    const arrVersionA = versionA.split('.').map(Number);
    const arrVersionB = versionB.split('.').map(Number);
    for (let i = 0; i < arrVersionA.length; ++i) {
      if (arrVersionB.length === i) {
        return 1;
      }
      if (arrVersionA[i] === arrVersionB[i]) {
        continue;
      } else if (arrVersionA[i] > arrVersionB[i]) {
        return 1;
      } else {
        return -1;
      }
    }
    if (arrVersionA.length !== arrVersionB.length) {
      return -1;
    }
    return 0;
  }

  generateUUID(): string {
    const idV4 = uuid.v4();

    return idV4.replace(/-/g, '');
  }

  splitFullName(fullName: string = ''): string[] {
    const [name, ...surnameTokens] = fullName
      .trim()
      .split(' ')
      .map((t) => t.trim())
      .reverse();
    return [surnameTokens.reverse().join(' '), name];
  }

  transform = (obj, predicate) => {
    return Object.keys(obj).reduce((memo, key) => {
      if (predicate(obj[key], key)) {
        memo[key] = obj[key];
      }
      return memo;
    }, {});
  };

  omit = (obj, items) => this.transform(obj, (value, key) => !items.includes(key));

  pick = (obj, items) => this.transform(obj, (value, key) => items.includes(key));

  getPlatformType(platform: string) {
    if (!platform) {
      return platform;
    }

    return ['ios', 'android', 'mobile'].includes(platform) ? 'mobile' : 'web';
  }

  sortedStringifyUrl(obj: any = {}) {
    const sortedKeys = Object.keys(obj)
      .filter((k) => obj[k] != undefined)
      .sort();

    const sortedParams = sortedKeys.map((key) => `${key}=${obj[key]}`);
    return sortedParams.join('&');
  }

  getUserCountryByLocale(locale) {
    switch (locale) {
      case 'km':
        return 'KH';
      default:
        return 'VN';
    }
  }

  groupByKey(data = [], iteratee: string) {
    return data.reduce((r, item) => {
      r[item[iteratee]] = item;

      return r;
    }, {});
  }

  handleDateForFilter(fromDate: string, toDate: string) {
    const dateStart = fromDate ? moment(fromDate) : moment();
    const dateEnd = toDate ? moment(toDate) : moment();
    // Handle UTC time
    const timeStart = dateStart
      .set({
        hours: 0,
        minutes: 0,
        seconds: 0,
      })
      .subtract(7, 'hours')
      .toDate();
    const timeEnd = dateEnd
      .set({
        hours: 23,
        minutes: 59,
        seconds: 59,
      })
      .subtract(7, 'hours')
      .toDate();
    return { timeStart, timeEnd };
  }

  handleDateTimeForFilter(fromDate: string, toDate: string) {
    const dateStart = fromDate ? moment(fromDate, 'YYYY-MM-DD HH:mm') : moment();
    const dateEnd = toDate ? moment(toDate, 'YYYY-MM-DD HH:mm') : moment();
    // Handle UTC time
    const timeStart = dateStart
      .set({
        hours: 0,
        minutes: 0,
        seconds: 0,
      })
      .subtract(7, 'hours')
      .toDate();
    const timeEnd = dateEnd
      .set({
        hours: 23,
        minutes: 59,
        seconds: 59,
      })
      .subtract(7, 'hours')
      .toDate();
    return { timeStart, timeEnd };
  }

  handleDateTime(fromDate: string, toDate: string) {
    const dateStart = fromDate ? moment(fromDate, 'YYYY-MM-DD HH:mm') : moment();
    const dateEnd = toDate ? moment(toDate, 'YYYY-MM-DD HH:mm') : moment();
    // Handle UTC time
    const timeStart = dateStart.subtract(7, 'hours').toDate();
    const timeEnd = dateEnd.subtract(7, 'hours').toDate();
    return { timeStart, timeEnd };
  }
}

export enum ResponseCode {
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export class ResponseMessage {
  en?: string;
  vi?: string;
  cam?: string;
}

export class ResponseModel<T> {
  data: T;
  http_code: HttpStatus;
  service?: string;
  error?: any;
  stack?: any;
  message?: ResponseMessage;
  code?: ResponseCode;
}
