import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as webPush from 'web-push';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private subscriptions: any[] = [];

  constructor(private readonly configService: ConfigService) {
    webPush.setVapidDetails(
      'mailto:tungnguyendn99@gmail.com',
      this.configService.get<string>('VAPID_PUBLIC_KEY')!,
      this.configService.get<string>('VAPID_PRIVATE_KEY')!,
    );
  }

  addSubscription(subscription: any) {
    console.log('subscription', subscription);
    this.subscriptions.push(subscription);
    this.logger.log(`Subscription added. Total: ${this.subscriptions.length}`);
  }

  async sendNotification(payload: any) {
    for (const sub of this.subscriptions) {
      try {
        await webPush.sendNotification(sub, JSON.stringify(payload));
      } catch (error) {
        this.logger.error(`Push failed: ${error}`);
      }
    }
  }
}
