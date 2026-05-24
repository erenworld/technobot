import { IsBoolean, IsIn, IsInt, IsOptional, IsString, IsUUID, Max, MaxLength, Min } from 'class-validator';
import { ConfigurationDepartValue } from '../../domain/MatchSumo';

export class CreateRencontreSumoDto {
  @IsOptional()
  @IsUUID()
  vainqueur_id?: string | null;

  @IsInt() @Min(0) @Max(5) yuko_a!: number;
  @IsInt() @Min(0) @Max(5) yuko_b!: number;
  @IsInt() @Min(0) @Max(5) yusei_a!: number;
  @IsInt() @Min(0) @Max(5) yusei_b!: number;

  @IsIn(['face_a_face', 'dos_a_dos', 'flanc_droit', 'flanc_gauche'])
  configuration_depart!: ConfigurationDepartValue;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(300)
  duree_secondes?: number;

  @IsBoolean()
  annulee!: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  observations?: string;
}
