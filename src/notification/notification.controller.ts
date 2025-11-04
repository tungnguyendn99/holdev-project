import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post('subscribe')
  addSubscription(@Body() subscription: any) {
    this.notificationService.addSubscription(subscription);
    return { success: true };
  }

  @Post('send')
  sendNotification(@Body() body: { title: string; body: string }) {
    this.notificationService.sendNotification(body);
    return { success: true };
  }
}
