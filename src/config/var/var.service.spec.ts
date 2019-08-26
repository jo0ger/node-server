import { Test, TestingModule } from '@nestjs/testing';
import { VarService } from './var.service';

describe('VarService', () => {
  let service: VarService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VarService],
    }).compile();

    service = module.get<VarService>(VarService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
