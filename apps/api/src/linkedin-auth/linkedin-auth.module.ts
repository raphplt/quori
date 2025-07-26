import { Module } from '@nestjs/common';
import { LinkedinAuthController } from './linkedin-auth.controller';
import { LinkedinAuthService } from './linkedin-auth.service';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [AuthModule, UsersModule],
  controllers: [LinkedinAuthController],
  providers: [LinkedinAuthService],
  exports: [LinkedinAuthService],
})
export class LinkedinAuthModule {}
