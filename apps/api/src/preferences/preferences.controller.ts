import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { PreferencesService } from './preferences.service';
import { CreatePreferenceDto } from './dto/create-preference.dto';
import { UpdatePreferenceDto } from './dto/update-preference.dto';
import { Preference } from './entities/preference.entity';

@ApiTags('preferences')
@Controller('preferences')
export class PreferencesController {
  constructor(private readonly preferencesService: PreferencesService) {}

  @Post()
  @ApiOperation({ summary: 'Créer les préférences utilisateur' })
  @ApiBody({ type: CreatePreferenceDto })
  @ApiResponse({
    status: 201,
    description: 'Préférences créées',
    type: Preference,
  })
  @ApiResponse({
    status: 400,
    description: 'Préférences déjà existantes ou données invalides',
  })
  async create(
    @Body() createPreferenceDto: CreatePreferenceDto,
  ): Promise<Preference> {
    return this.preferencesService.create(createPreferenceDto);
  }

  @Get(':userId')
  @ApiOperation({ summary: 'Récupérer les préférences utilisateur par userId' })
  @ApiParam({ name: 'userId', type: String })
  @ApiResponse({
    status: 200,
    description: 'Préférences trouvées',
    type: Preference,
  })
  @ApiResponse({ status: 404, description: 'Préférences non trouvées' })
  async findByUserId(@Param('userId') userId: string): Promise<Preference> {
    return this.preferencesService.findByUserId(userId);
  }

  @Patch(':userId')
  @ApiOperation({
    summary: 'Mettre à jour les préférences utilisateur par userId',
  })
  @ApiParam({ name: 'userId', type: String })
  @ApiBody({ type: UpdatePreferenceDto })
  @ApiResponse({
    status: 200,
    description: 'Préférences mises à jour',
    type: Preference,
  })
  @ApiResponse({ status: 404, description: 'Préférences non trouvées' })
  async updateByUserId(
    @Param('userId') userId: string,
    @Body() updatePreferenceDto: UpdatePreferenceDto,
  ): Promise<Preference> {
    return this.preferencesService.updateByUserId(userId, updatePreferenceDto);
  }

  @Delete(':userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Supprimer les préférences utilisateur par userId' })
  @ApiParam({ name: 'userId', type: String })
  @ApiResponse({ status: 204, description: 'Préférences supprimées' })
  @ApiResponse({ status: 404, description: 'Préférences non trouvées' })
  async deleteByUserId(@Param('userId') userId: string): Promise<void> {
    return this.preferencesService.deleteByUserId(userId);
  }
}
