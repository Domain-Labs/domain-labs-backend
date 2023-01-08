import { Test, TestingModule } from '@nestjs/testing';
import { AccessesController } from './accesses.controller';
import { CreateAccessDto } from './dto/create-access.dto';
import { AccessesService } from './accesses.service';

describe('Accesses Controller', () => {
  let controller: AccessesController;
  let service: AccessesService;
  const createAccessDto: CreateAccessDto = {
    name: 'Access #1',
    breed: 'Breed #1',
    age: 4,
  };

  const mockAccess = {
    name: 'Access #1',
    breed: 'Breed #1',
    age: 4,
    _id: 'a id',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccessesController],
      providers: [
        {
          provide: AccessesService,
          useValue: {
            findAll: jest.fn().mockResolvedValue([
              {
                name: 'Access #1',
                breed: 'Bread #1',
                age: 4,
              },
              {
                name: 'Access #2',
                breed: 'Breed #2',
                age: 3,
              },
              {
                name: 'Access #3',
                breed: 'Breed #3',
                age: 2,
              },
            ]),
            create: jest.fn().mockResolvedValue(createAccessDto),
          },
        },
      ],
    }).compile();

    controller = module.get<AccessesController>(AccessesController);
    service = module.get<AccessesService>(AccessesService);
  });

  describe('create()', () => {
    it('should create a new access', async () => {
      const createSpy = jest
        .spyOn(service, 'create')
        .mockResolvedValueOnce(mockAccess);

      await controller.create(createAccessDto);
      expect(createSpy).toHaveBeenCalledWith(createAccessDto);
    });
  });

  describe('findAll()', () => {
    it('should return an array of accesses', async () => {
      expect(controller.findAll()).resolves.toEqual([
        {
          name: 'Access #1',
          breed: 'Bread #1',
          age: 4,
        },
        {
          name: 'Access #2',
          breed: 'Breed #2',
          age: 3,
        },
        {
          name: 'Access #3',
          breed: 'Breed #3',
          age: 2,
        },
      ]);
      expect(service.findAll).toHaveBeenCalled();
    });
  });
});
