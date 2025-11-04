import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
// import { JwtUserConfigService } from 'src/config/config.user.jwt.service';

@Injectable()
export class UserJwtStrategy extends PassportStrategy(Strategy, 'user-jwt') {
  constructor() {
    // private readonly jwtUserConfigService: JwtUserConfigService
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // secretOrKey: jwtUserConfigService.get<string>('USER_JWT_SECRET'),
      secretOrKey: 'secretToken123',
    });
  }

  async validate(payload: any) {
    return { username: payload.username, userId: payload.userId };
  }
}
