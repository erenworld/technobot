import { IsBoolean, IsInt, IsOptional, IsString, IsUUID, Max, MaxLength, Min } from 'class-validator';

export class CreateScoreDesignDto {
  @IsUUID()
  team_id!: string;

  @IsUUID()
  jury_id!: string;

  @IsInt() @Min(0) @Max(2) access_interrupteur!: number;
  @IsInt() @Min(0) @Max(2) refroid_carte!: number;
  @IsInt() @Min(0) @Max(2) acces_cable_prog!: number;
  @IsInt() @Min(0) @Max(2) facilite_piles!: number;
  @IsInt() @Min(0) @Max(2) solidite!: number;
  @IsInt() @Min(0) @Max(2) homogeneite!: number;
  @IsInt() @Min(0) @Max(2) oeuvre_originale!: number;
  @IsInt() @Min(0) @Max(2) qualite_visuelle!: number;
  @IsInt() @Min(0) @Max(2) dissimulation_pieces!: number;
  @IsInt() @Min(0) @Max(2) qualite_affiche!: number;
  @IsInt() @Min(0) @Max(2) qualite_echange!: number;

  @IsBoolean() bonus_suivi_ovale!: boolean;
  @IsBoolean() bonus_connecte!: boolean;

  @IsOptional() @IsString() @MaxLength(1000) observations?: string;
}
