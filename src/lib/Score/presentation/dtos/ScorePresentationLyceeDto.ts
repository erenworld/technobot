import { IsInt, IsOptional, IsString, IsUUID, Max, MaxLength, Min } from 'class-validator';

export class CreateScorePresentationLyceeDto {
  @IsUUID() team_id!: string;
  @IsUUID() jury_id!: string;
  @IsInt() @Min(0) @Max(5) repartition_temps_parole!: number;
  @IsInt() @Min(0) @Max(5) qualite_visuel_presentation!: number;
  @IsInt() @Min(0) @Max(5) justesse_technique!: number;
  @IsInt() @Min(0) @Max(5) competences_linguistiques!: number;
  @IsInt() @Min(0) @Max(5) vocabulaire_technique!: number;
  @IsInt() @Min(0) @Max(5) dossier_technique_lv!: number;
  @IsInt() @Min(0) @Max(5) echanges_techniques!: number;
  @IsOptional() @IsString() @MaxLength(1000) observations?: string;
}

export class UpdateScorePresentationLyceeDto {
  @IsOptional() @IsInt() @Min(0) @Max(5) repartition_temps_parole?: number;
  @IsOptional() @IsInt() @Min(0) @Max(5) qualite_visuel_presentation?: number;
  @IsOptional() @IsInt() @Min(0) @Max(5) justesse_technique?: number;
  @IsOptional() @IsInt() @Min(0) @Max(5) competences_linguistiques?: number;
  @IsOptional() @IsInt() @Min(0) @Max(5) vocabulaire_technique?: number;
  @IsOptional() @IsInt() @Min(0) @Max(5) dossier_technique_lv?: number;
  @IsOptional() @IsInt() @Min(0) @Max(5) echanges_techniques?: number;
  @IsOptional() @IsString() @MaxLength(1000) observations?: string;
}
