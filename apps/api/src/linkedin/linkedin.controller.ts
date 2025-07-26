import { Controller, Post as HttpPost, Param, UseGuards, Request } from '@nestjs/common';
import { LinkedinPublisherService } from './linkedin-publisher.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

interface AuthenticatedRequest {
  user: { id: string };
}

@ApiTags('linkedin')
@UseGuards(JwtAuthGuard)
@Controller('linkedin')
export class LinkedinController {
  constructor(private readonly publisher: LinkedinPublisherService) {}

  @HttpPost('publish/:postId')
  @ApiOperation({ summary: 'Publier un post sur LinkedIn' })
  publish(@Param('postId') id: string, @Request() req: AuthenticatedRequest) {
    return this.publisher.publish(req.user.id, Number(id));
  }
}
