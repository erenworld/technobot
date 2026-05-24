import { ClassementEntry } from '../../domain/ClassementEntry';
import { SupabaseClassementRepository } from '../../infrastructure/repositories/SupabaseClassementRepository';

export interface ClassementsResult {
  readonly colleges: ClassementEntry[];
  readonly lycees: ClassementEntry[];
}

export class GetClassementsUseCase {
  constructor(private readonly classementRepository: SupabaseClassementRepository) {}

  async execute(editionId: string): Promise<ClassementsResult> {
    return this.classementRepository.getClassements(editionId);
  }
}
