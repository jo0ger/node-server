import { LoggerInterceptor } from './logger.interceptor';
import { TestingModule, Test } from '@nestjs/testing';
import { LoggerService } from './logger.service';

describe('LoggerInterceptor', () => {
  let service: LoggerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LoggerService],
    }).compile();

    service = module.get<LoggerService>(LoggerService);
  });

  it('should be defined', () => {
    expect(new LoggerInterceptor(service)).toBeDefined();
  });
});
