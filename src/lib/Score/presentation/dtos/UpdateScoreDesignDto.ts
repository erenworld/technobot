import { IsBoolean, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class UpdateScoreDesignDto {
  @IsOptional() @IsInt() @Min(0) @Max(2) access_interrupteur?: number;
  @IsOptional() @IsInt() @Min(0) @Max(2) refroid_carte?: number;
  @IsOptional() @IsInt() @Min(0) @Max(2) acces_cable_prog?: number;
  @IsOptional() @IsInt() @Min(0) @Max(2) facilite_piles?: number;
  @IsOptional() @IsInt() @Min(0) @Max(2) solidite?: number;
  @IsOptional() @IsInt() @Min(0) @Max(2) homogeneite?: number;
  @IsOptional() @IsInt() @Min(0) @Max(2) oeuvre_originale?: number;
  @IsOptional() @IsInt() @Min(0) @Max(2) qualite_visuelle?: number;
  @IsOptional() @IsInt() @Min(0) @Max(2) dissimulation_pieces?: number;
  @IsOptional() @IsInt() @Min(0) @Max(2) qualite_affiche?: number;
  @IsOptional() @IsInt() @Min(0) @Max(2) qualite_echange?: number;
  @IsOptional() @IsBoolean() bonus_suivi_ovale?: boolean;
  @IsOptional() @IsBoolean() bonus_connecte?: boolean;
  @IsOptional() @IsString() @MaxLength(1000) observations?: string;
}
