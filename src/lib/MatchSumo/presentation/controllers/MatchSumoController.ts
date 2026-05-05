import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { SupabaseAuthGuard } from '../../../../common/guards/SupabaseAuthGuard';
import { PermissionsGuard } from '../../../../common/guards/PermissionsGuard';
import { RequirePermissions } from '../../../../common/decorators/RequirePermissions.decorator';
import { Permission } from '../../../../common/permissions/Permission';
import { GetMatchSumoUseCase } from '../../application/use-cases/GetMatchSumoUseCase';
import { GetMatchsSumoUseCase } from '../../application/use-cases/GetMatchsSumoUseCase';
import { CreateRencontreSumoUseCase } from '../../application/use-cases/CreateRencontreSumoUseCase';
import { CreateRencontreSumoDto } from '../dtos/CreateRencontreSumoDto';

@UseGuards(SupabaseAuthGuard, PermissionsGuard)
@Controller('matchs-sumo')
export class MatchSumoController {
  constructor(
    private readonly getMatchSumoUseCase: GetMatchSumoUseCase,
    private readonly getMatchsSumoUseCase: GetMatchsSumoUseCase,
    private readonly createRencontreSumoUseCase: CreateRencontreSumoUseCase,
  ) {}

  @Get()
  @RequirePermissions(Permission.READ_MATCHS)
  async getAll(
    @Query('edition_id') editionId?: string,
    @Query('poule') poule?: string,
    @Query('zone') zone?: string,
    @Query('statut') statut?: string,
  ) {
    const matchs = await this.getMatchsSumoUseCase.execute({ editionId, poule, zone, statut });
    return matchs.map((m) => m.toPlainObject());
  }

  @Get(':id')
  @RequirePermissions(Permission.READ_MATCHS)
  async getMatch(@Param('id') id: string) {
    const match = await this.getMatchSumoUseCase.execute(id);
    return match.toPlainObject();
  }

  @Post(':id/rencontres')
  @RequirePermissions(Permission.CREATE_RENCONTRE)
  async createRencontre(@Param('id') id: string, @Body() dto: CreateRencontreSumoDto) {
    const rencontre = await this.createRencontreSumoUseCase.execute(id, {
      vainqueurId: dto.vainqueur_id ?? null,
      yukoA: dto.yuko_a,
      yukoB: dto.yuko_b,
      yuseiA: dto.yusei_a,
      yuseiB: dto.yusei_b,
      configurationDepart: dto.configuration_depart,
      dureeSecondes: dto.duree_secondes ?? null,
      annulee: dto.annulee,
      observations: dto.observations ?? null,
    });
    return rencontre.toPlainObject();
  }
}
