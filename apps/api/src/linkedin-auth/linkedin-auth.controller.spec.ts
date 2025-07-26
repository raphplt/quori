import { LinkedinAuthController } from './linkedin-auth.controller';
import { LinkedinAuthService } from './linkedin-auth.service';
import { ConfigService } from '@nestjs/config';

describe('LinkedinAuthController', () => {
  it('redirects to LinkedIn', () => {
    const service = {} as LinkedinAuthService;
    const users = {} as any;
    const controller = new LinkedinAuthController(
      new ConfigService(),
      service,
      users,
    );
    const res = { redirect: jest.fn() } as any;
    controller.redirect(res, 'u1');
    expect(res.redirect).toHaveBeenCalled();
  });
});
