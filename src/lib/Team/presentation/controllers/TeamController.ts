import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SupabaseAuthGuard } from '../../../../common/guards/SupabaseAuthGuard';
import { PermissionsGuard } from '../../../../common/guards/PermissionsGuard';
import { RequirePermissions } from '../../../../common/decorators/RequirePermissions.decorator';
import { Permission } from '../../../../common/permissions/Permission';
import { GetTeamsUseCase } from '../../application/use-cases/GetTeamsUseCase';
import { GetTeamByIdUseCase } from '../../application/use-cases/GetTeamByIdUseCase';
import { UpdateControleTechniqueUseCase } from '../../application/use-cases/UpdateControleTechniqueUseCase';
import { UpdateControleTechniqueDto } from '../dtos/UpdateControleTechniqueDto';
import { TeamCategorieValue } from '../../domain/TeamCategorie';
import { TeamEpreuveValue } from '../../domain/TeamEpreuve';
import { TeamStatutValue } from '../../domain/TeamStatut';

@UseGuards(SupabaseAuthGuard, PermissionsGuard)
@Controller('teams')
export class TeamController {
  constructor(
    private readonly getTeamsUseCase: GetTeamsUseCase,
    private readonly getTeamByIdUseCase: GetTeamByIdUseCase,
    private readonly updateControleTechniqueUseCase: UpdateControleTechniqueUseCase,
  ) {}

  @Get()
  @RequirePermissions(Permission.READ_TEAMS)
  async getAll(
    @Query('categorie') categorie?: TeamCategorieValue,
    @Query('epreuve') epreuve?: TeamEpreuveValue,
    @Query('statut') statut?: TeamStatutValue,
    @Query('edition_id') editionId?: string,
  ) {
    const teams = await this.getTeamsUseCase.execute({ categorie, epreuve, statut, editionId });
    return teams.map((t) => t.toPlainObject());
  }

  @Get(':id')
  @RequirePermissions(Permission.READ_TEAMS)
  async getOne(@Param('id') id: string) {
    const team = await this.getTeamByIdUseCase.execute(id);
    return team.toPlainObject();
  }

  @Post(':id/controle-technique')
  @RequirePermissions(Permission.VALIDATE_CONTROLE_TECHNIQUE)
  async updateControleTechnique(
    @Param('id') id: string,
    @Body() dto: UpdateControleTechniqueDto,
  ) {
    await this.updateControleTechniqueUseCase.execute(id, {
      statut: dto.statut,
      notesTechnique: dto.notes_technique,
    });
    return { success: true };
  }
}
