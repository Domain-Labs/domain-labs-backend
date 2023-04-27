import { Test, TestingModule } from '@nestjs/testing';
import { CliosController } from './clios.controller';
import { CreateClioDto } from './dto/create-clio.dto';
import { CliosService } from './clios.service';

describe('Clios Controller', () => {
  let controller: CliosController;
  let service: CliosService;
  const createClioDto: CreateClioDto = {
    name: 'Clio #1',
    breed: 'Breed #1',
    age: 4,
  };

  const mockClio = {
    name: 'Clio #1',
    breed: 'Breed #1',
    age: 4,
    _id: 'a id',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CliosController],
      providers: [
        {
          provide: CliosService,
          useValue: {
            findAll: jest.fn().mockResolvedValue([
              {
                name: 'Clio #1',
                breed: 'Bread #1',
                age: 4,
              },
              {
                name: 'Clio #2',
                breed: 'Breed #2',
                age: 3,
              },
              {
                name: 'Clio #3',
                breed: 'Breed #3',
                age: 2,
              },
            ]),
            create: jest.fn().mockResolvedValue(createClioDto),
          },
        },
      ],
    }).compile();

    controller = module.get<CliosController>(CliosController);
    service = module.get<CliosService>(CliosService);
  });

  describe('create()', () => {
    it('should create a new clio', async () => {
      const createSpy = jest
        .spyOn(service, 'create')
        .mockResolvedValueOnce(mockClio);

      await controller.create(createClioDto);
      expect(createSpy).toHaveBeenCalledWith(createClioDto);
    });
  });

  describe('findAll()', () => {
    it('should return an array of clios', async () => {
      expect(controller.findAll()).resolves.toEqual([
        {
          name: 'Clio #1',
          breed: 'Bread #1',
          age: 4,
        },
        {
          name: 'Clio #2',
          breed: 'Breed #2',
          age: 3,
        },
        {
          name: 'Clio #3',
          breed: 'Breed #3',
          age: 2,
        },
      ]);
      expect(service.findAll).toHaveBeenCalled();
    });
  });
});
