import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { TeamNotFoundException } from '../exceptions/TeamNotFoundException';
import { ScoreAlreadyExistsException } from '../exceptions/ScoreAlreadyExistsException';
import { UnauthorizedScoreModificationException } from '../exceptions/UnauthorizedScoreModificationException';
import { MatchAlreadyFinishedException } from '../exceptions/MatchAlreadyFinishedException';
import { ProfileNotFoundException } from '../exceptions/ProfileNotFoundException';
import { MatchSumoNotFoundException } from '../exceptions/MatchSumoNotFoundException';
import { ScoreNotFoundException } from '../exceptions/ScoreNotFoundException';

@Catch(
  TeamNotFoundException,
  ScoreAlreadyExistsException,
  UnauthorizedScoreModificationException,
  MatchAlreadyFinishedException,
  ProfileNotFoundException,
  MatchSumoNotFoundException,
  ScoreNotFoundException,
)
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const statusMap: Record<string, number> = {
      TeamNotFoundException: HttpStatus.NOT_FOUND,
      ScoreNotFoundException: HttpStatus.NOT_FOUND,
      MatchSumoNotFoundException: HttpStatus.NOT_FOUND,
      ScoreAlreadyExistsException: HttpStatus.CONFLICT,
      MatchAlreadyFinishedException: HttpStatus.CONFLICT,
      UnauthorizedScoreModificationException: HttpStatus.FORBIDDEN,
      ProfileNotFoundException: HttpStatus.FORBIDDEN,
    };

    const status = statusMap[exception.name] ?? HttpStatus.INTERNAL_SERVER_ERROR;

    response.status(status).json({
      statusCode: status,
      error: exception.name,
      message: exception.message,
    });
  }
}
