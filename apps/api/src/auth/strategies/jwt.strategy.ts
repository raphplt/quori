import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { AuthService, JwtPayload } from '../auth.service';
import { User } from '../../users/user.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>('JWT_SECRET') || 'default-jwt-secret',
    });
  }

  validate(payload: JwtPayload): User {
    const user = this.authService.validateJwtPayload(payload);
    if (!user) {
      throw new UnauthorizedException('Invalid token');
    }
    return user;
  }
}
