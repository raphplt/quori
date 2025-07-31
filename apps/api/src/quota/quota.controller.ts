import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  UseGuards,
  Request,
  Sse,
  Res,
  Options,
  UnauthorizedException,
} from '@nestjs/common';
import { Response } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GenerateService } from '../github/services/generate.service';
import { GenerateDto, GenerateResultDto } from '../github/dto/generate.dto';
import { QuotaService } from './quota.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

interface AuthReq {
  user: { id: string };
}

@Controller()
export class QuotaController {
  constructor(
    private readonly quotaService: QuotaService,
    private readonly generateService: GenerateService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private verifyToken(token: string): any {
    if (!token) {
      throw new UnauthorizedException('Token required');
    }

    try {
      const jwtSecret = this.configService.get<string>('JWT_SECRET') || 'default-jwt-secret';
      return this.jwtService.verify(token, { secret: jwtSecret });
    } catch (error) {
      console.error('JWT verification failed:', error);
      throw new UnauthorizedException('Invalid token');
    }
  }

  @Post('generate')
  @UseGuards(JwtAuthGuard)
  async generate(
    @Request() req: AuthReq,
    @Body() body: GenerateDto,
    @Query('installationId') installationId?: string,
    @Query('eventDeliveryId') eventDeliveryId?: string,
  ): Promise<GenerateResultDto> {
    const userId = req.user.id;
    await this.quotaService.consume(userId);
    const installation = installationId
      ? parseInt(installationId, 10)
      : undefined;
    return this.generateService.generate(
      userId,
      body,
      installation,
      eventDeliveryId,
    );
  }

  @Get('quota')
  @UseGuards(JwtAuthGuard)
  async getQuota(@Request() req: AuthReq) {
    return this.quotaService.getUsage(req.user.id);
  }

  @Sse('quota/stream')
  streamQuota(
    @Query('token') token: string,
    @Res({ passthrough: true }) res: Response,
  ): Observable<{ data: string; type: string }> {
    // Configuration CORS spécifique pour les SSE
    res.setHeader(
      'Access-Control-Allow-Origin',
      process.env.FRONTEND_URL || 'http://localhost:3000',
    );
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Cache-Control, Last-Event-ID',
    );
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');

    // Vérifier le token
    this.verifyToken(token);

    return this.quotaService.getQuotaStream(token).pipe(
      map((data) => ({
        data: JSON.stringify(data),
        type: data.type,
      })),
    );
  }

  @Options('quota/stream')
  handleQuotaStreamOptions(@Res() res: Response) {
    res.setHeader(
      'Access-Control-Allow-Origin',
      process.env.FRONTEND_URL || 'http://localhost:3000',
    );
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Cache-Control, Last-Event-ID',
    );
    res.status(200).send();
  }
}
