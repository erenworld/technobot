import { IsBoolean, IsInt, IsOptional, IsString, IsUUID, Max, MaxLength, Min } from 'class-validator';

export class CreateScorePresentationCollegeDto {
  @IsUUID() team_id!: string;
  @IsUUID() jury_id!: string;
  @IsInt() @Min(0) @Max(4) aisance!: number;
  @IsInt() @Min(0) @Max(4) langues!: number;
  @IsInt() @Min(0) @Max(4) contenu!: number;
  @IsInt() @Min(0) @Max(4) outils!: number;
  @IsBoolean() bonus_suivi_ovale!: boolean;
  @IsBoolean() bonus_connecte!: boolean;
  @IsOptional() @IsString() @MaxLength(1000) observations?: string;
}

export class UpdateScorePresentationCollegeDto {
  @IsOptional() @IsInt() @Min(0) @Max(4) aisance?: number;
  @IsOptional() @IsInt() @Min(0) @Max(4) langues?: number;
  @IsOptional() @IsInt() @Min(0) @Max(4) contenu?: number;
  @IsOptional() @IsInt() @Min(0) @Max(4) outils?: number;
  @IsOptional() @IsBoolean() bonus_suivi_ovale?: boolean;
  @IsOptional() @IsBoolean() bonus_connecte?: boolean;
  @IsOptional() @IsString() @MaxLength(1000) observations?: string;
}
