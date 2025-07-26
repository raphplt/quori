import { LinkedinAuthController } from './linkedin-auth.controller';
import { LinkedinAuthService } from './linkedin-auth.service';
import { ConfigService } from '@nestjs/config';

describe('LinkedinAuthController', () => {
  it('redirects to LinkedIn', () => {
    const service = {} as LinkedinAuthService;
    const controller = new LinkedinAuthController(new ConfigService(), service);
    const res = { redirect: jest.fn() } as any;
    controller.redirect(res);
    expect(res.redirect).toHaveBeenCalled();
  });
});
