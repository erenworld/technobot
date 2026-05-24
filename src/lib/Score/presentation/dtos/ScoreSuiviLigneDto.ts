import { IsBoolean, IsInt, IsNumber, IsOptional, IsString, IsUUID, Max, MaxLength, Min } from 'class-validator';

export class CreateScoreSuiviLigneDto {
  @IsUUID() team_id!: string;
  @IsUUID() jury_id!: string;
  @IsInt() @Min(0) @Max(100) distance_pct!: number;
  @IsBoolean() parcours_fini!: boolean;
  @IsOptional() @IsNumber() @Min(0) temps_secondes?: number;
  @IsBoolean() bonus_trace_1!: boolean;
  @IsBoolean() bonus_trace_2!: boolean;
  @IsBoolean() bonus_trace_3!: boolean;
  @IsBoolean() bonus_trace_4!: boolean;
  @IsBoolean() bonus_trace_5!: boolean;
  @IsBoolean() bonus_trace_6!: boolean;
  @IsOptional() @IsString() @MaxLength(1000) observations?: string;
}

export class UpdateScoreSuiviLigneDto {
  @IsOptional() @IsInt() @Min(0) @Max(100) distance_pct?: number;
  @IsOptional() @IsBoolean() parcours_fini?: boolean;
  @IsOptional() @IsNumber() @Min(0) temps_secondes?: number;
  @IsOptional() @IsBoolean() bonus_trace_1?: boolean;
  @IsOptional() @IsBoolean() bonus_trace_2?: boolean;
  @IsOptional() @IsBoolean() bonus_trace_3?: boolean;
  @IsOptional() @IsBoolean() bonus_trace_4?: boolean;
  @IsOptional() @IsBoolean() bonus_trace_5?: boolean;
  @IsOptional() @IsBoolean() bonus_trace_6?: boolean;
  @IsOptional() @IsString() @MaxLength(1000) observations?: string;
}
