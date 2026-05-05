import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { TeamStatutValue } from '../../domain/TeamStatut';

export class UpdateControleTechniqueDto {
  @IsIn(['valide', 'controle_technique_ok', 'disqualifie'])
  statut!: TeamStatutValue;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes_technique?: string;
}
