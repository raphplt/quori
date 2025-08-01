import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DEFAULT_JWT_SECRET } from '../common/constants';

import { GithubStrategy } from './strategies/github.strategy';
import { AuthController } from './auth.controller';
import { AuthSyncController } from './auth-sync.controller';
import { UsersModule } from 'src/users/users.module';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    UsersModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const jwtSecret = configService.get<string>('JWT_SECRET');
        const isProduction = configService.get('NODE_ENV') === 'production';

        if (!jwtSecret) {
          if (isProduction) {
            throw new Error('JWT_SECRET is required in production environment');
          }
          console.warn(
            '⚠️  JWT_SECRET not configured, using temporary secret for development',
          );
        }

        return {
          secret: jwtSecret || DEFAULT_JWT_SECRET,
          signOptions: {
            expiresIn: configService.get<string>('JWT_EXPIRES_IN', '7d'),
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController, AuthSyncController],
  providers: [AuthService, GithubStrategy, JwtStrategy],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
