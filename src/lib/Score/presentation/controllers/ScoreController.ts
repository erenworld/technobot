import {
  Body,
  Controller,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { SupabaseAuthGuard } from '../../../../common/guards/SupabaseAuthGuard';
import { PermissionsGuard } from '../../../../common/guards/PermissionsGuard';
import { RequirePermissions } from '../../../../common/decorators/RequirePermissions.decorator';
import { Permission } from '../../../../common/permissions/Permission';
import { CurrentUser, } from '../../../../common/decorators/CurrentUser.decorator';
import { AuthenticatedUser } from '../../../../common/guards/SupabaseAuthGuard';
import { CreateScoreDesignUseCase } from '../../application/use-cases/CreateScoreDesignUseCase';
import { UpdateScoreDesignUseCase } from '../../application/use-cases/UpdateScoreDesignUseCase';
import { CreateScorePresentationCollegeUseCase } from '../../application/use-cases/CreateScorePresentationCollegeUseCase';
import { UpdateScorePresentationCollegeUseCase } from '../../application/use-cases/UpdateScorePresentationCollegeUseCase';
import { CreateScorePresentationLyceeUseCase } from '../../application/use-cases/CreateScorePresentationLyceeUseCase';
import { UpdateScorePresentationLyceeUseCase } from '../../application/use-cases/UpdateScorePresentationLyceeUseCase';
import { CreateScoreSuiviLigneUseCase } from '../../application/use-cases/CreateScoreSuiviLigneUseCase';
import { UpdateScoreSuiviLigneUseCase } from '../../application/use-cases/UpdateScoreSuiviLigneUseCase';
import { CreateScoreDesignDto } from '../dtos/CreateScoreDesignDto';
import { UpdateScoreDesignDto } from '../dtos/UpdateScoreDesignDto';
import { CreateScorePresentationCollegeDto, UpdateScorePresentationCollegeDto } from '../dtos/ScorePresentationCollegeDto';
import { CreateScorePresentationLyceeDto, UpdateScorePresentationLyceeDto } from '../dtos/ScorePresentationLyceeDto';
import { CreateScoreSuiviLigneDto, UpdateScoreSuiviLigneDto } from '../dtos/ScoreSuiviLigneDto';

@UseGuards(SupabaseAuthGuard, PermissionsGuard)
@Throttle({ default: { limit: 10, ttl: 60000 } })
@Controller('scores')
export class ScoreController {
  constructor(
    private readonly createDesign: CreateScoreDesignUseCase,
    private readonly updateDesign: UpdateScoreDesignUseCase,
    private readonly createPresCol: CreateScorePresentationCollegeUseCase,
    private readonly updatePresCol: UpdateScorePresentationCollegeUseCase,
    private readonly createPresLyc: CreateScorePresentationLyceeUseCase,
    private readonly updatePresLyc: UpdateScorePresentationLyceeUseCase,
    private readonly createSuivi: CreateScoreSuiviLigneUseCase,
    private readonly updateSuivi: UpdateScoreSuiviLigneUseCase,
  ) {}

  @Post('design')
  @RequirePermissions(Permission.CREATE_SCORES)
  async createScoreDesign(@Body() dto: CreateScoreDesignDto, @CurrentUser() user: AuthenticatedUser) {
    const score = await this.createDesign.execute(
      {
        teamId: dto.team_id,
        juryId: dto.jury_id,
        accessInterrupteur: dto.access_interrupteur,
        refroidCarte: dto.refroid_carte,
        acesCableProg: dto.acces_cable_prog,
        facilitePiles: dto.facilite_piles,
        solidite: dto.solidite,
        homogeneite: dto.homogeneite,
        oeuvreOriginale: dto.oeuvre_originale,
        qualiteVisuelle: dto.qualite_visuelle,
        dissimulationPieces: dto.dissimulation_pieces,
        qualiteAffiche: dto.qualite_affiche,
        qualiteEchange: dto.qualite_echange,
        bonusSuiviOvale: dto.bonus_suivi_ovale,
        bonusConnecte: dto.bonus_connecte,
        observations: dto.observations ?? null,
      },
      user.id,
    );
    return score.toPlainObject();
  }

  @Put('design/:id')
  @RequirePermissions(Permission.UPDATE_OWN_SCORES)
  async updateScoreDesign(
    @Param('id') id: string,
    @Body() dto: UpdateScoreDesignDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const score = await this.updateDesign.execute(
      id,
      {
        accessInterrupteur: dto.access_interrupteur,
        refroidCarte: dto.refroid_carte,
        acesCableProg: dto.acces_cable_prog,
        facilitePiles: dto.facilite_piles,
        solidite: dto.solidite,
        homogeneite: dto.homogeneite,
        oeuvreOriginale: dto.oeuvre_originale,
        qualiteVisuelle: dto.qualite_visuelle,
        dissimulationPieces: dto.dissimulation_pieces,
        qualiteAffiche: dto.qualite_affiche,
        qualiteEchange: dto.qualite_echange,
        bonusSuiviOvale: dto.bonus_suivi_ovale,
        bonusConnecte: dto.bonus_connecte,
        observations: dto.observations,
      },
      user.id,
    );
    return score.toPlainObject();
  }

  @Post('presentation-colleges')
  @RequirePermissions(Permission.CREATE_SCORES)
  async createScorePresCol(@Body() dto: CreateScorePresentationCollegeDto, @CurrentUser() user: AuthenticatedUser) {
    const score = await this.createPresCol.execute(
      { teamId: dto.team_id, juryId: dto.jury_id, aisance: dto.aisance, langues: dto.langues, contenu: dto.contenu, outils: dto.outils, bonusSuiviOvale: dto.bonus_suivi_ovale, bonusConnecte: dto.bonus_connecte, observations: dto.observations ?? null },
      user.id,
    );
    return score.toPlainObject();
  }

  @Put('presentation-colleges/:id')
  @RequirePermissions(Permission.UPDATE_OWN_SCORES)
  async updateScorePresCol(
    @Param('id') id: string,
    @Body() dto: UpdateScorePresentationCollegeDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const score = await this.updatePresCol.execute(
      id,
      { aisance: dto.aisance, langues: dto.langues, contenu: dto.contenu, outils: dto.outils, bonusSuiviOvale: dto.bonus_suivi_ovale, bonusConnecte: dto.bonus_connecte, observations: dto.observations },
      user.id,
    );
    return score.toPlainObject();
  }

  @Post('presentation-lycees')
  @RequirePermissions(Permission.CREATE_SCORES)
  async createScorePresLyc(@Body() dto: CreateScorePresentationLyceeDto, @CurrentUser() user: AuthenticatedUser) {
    const score = await this.createPresLyc.execute(
      { teamId: dto.team_id, juryId: dto.jury_id, repartitionTempsParole: dto.repartition_temps_parole, qualiteVisuelPresentation: dto.qualite_visuel_presentation, justesseTechnique: dto.justesse_technique, competencesLinguistiques: dto.competences_linguistiques, vocabulaireTechnique: dto.vocabulaire_technique, dossierTechniqueLv: dto.dossier_technique_lv, echangesTechniques: dto.echanges_techniques, observations: dto.observations ?? null },
      user.id,
    );
    return score.toPlainObject();
  }

  @Put('presentation-lycees/:id')
  @RequirePermissions(Permission.UPDATE_OWN_SCORES)
  async updateScorePresLyc(
    @Param('id') id: string,
    @Body() dto: UpdateScorePresentationLyceeDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const score = await this.updatePresLyc.execute(
      id,
      { repartitionTempsParole: dto.repartition_temps_parole, qualiteVisuelPresentation: dto.qualite_visuel_presentation, justesseTechnique: dto.justesse_technique, competencesLinguistiques: dto.competences_linguistiques, vocabulaireTechnique: dto.vocabulaire_technique, dossierTechniqueLv: dto.dossier_technique_lv, echangesTechniques: dto.echanges_techniques, observations: dto.observations },
      user.id,
    );
    return score.toPlainObject();
  }

  @Post('suivi-ligne')
  @RequirePermissions(Permission.CREATE_SCORES)
  async createScoreSuivi(@Body() dto: CreateScoreSuiviLigneDto, @CurrentUser() user: AuthenticatedUser) {
    const score = await this.createSuivi.execute(
      { teamId: dto.team_id, juryId: dto.jury_id, distancePct: dto.distance_pct, parcoursFini: dto.parcours_fini, tempsSecondes: dto.temps_secondes ?? null, bonusTrace1: dto.bonus_trace_1, bonusTrace2: dto.bonus_trace_2, bonusTrace3: dto.bonus_trace_3, bonusTrace4: dto.bonus_trace_4, bonusTrace5: dto.bonus_trace_5, bonusTrace6: dto.bonus_trace_6, observations: dto.observations ?? null },
      user.id,
    );
    return score.toPlainObject();
  }

  @Put('suivi-ligne/:id')
  @RequirePermissions(Permission.UPDATE_OWN_SCORES)
  async updateScoreSuivi(
    @Param('id') id: string,
    @Body() dto: UpdateScoreSuiviLigneDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const score = await this.updateSuivi.execute(
      id,
      { distancePct: dto.distance_pct, parcoursFini: dto.parcours_fini, tempsSecondes: dto.temps_secondes, bonusTrace1: dto.bonus_trace_1, bonusTrace2: dto.bonus_trace_2, bonusTrace3: dto.bonus_trace_3, bonusTrace4: dto.bonus_trace_4, bonusTrace5: dto.bonus_trace_5, bonusTrace6: dto.bonus_trace_6, observations: dto.observations },
      user.id,
    );
    return score.toPlainObject();
  }
}
