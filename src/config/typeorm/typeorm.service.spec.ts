import { Test, TestingModule } from '@nestjs/testing'
import { TypeormService } from './typeorm.service'

describe('TypeormService', () => {
  let service: TypeormService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TypeormService],
    }).compile()

    service = module.get<TypeormService>(TypeormService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
