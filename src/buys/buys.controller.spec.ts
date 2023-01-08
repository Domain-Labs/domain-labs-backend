import { Test, TestingModule } from '@nestjs/testing';
import { BuysController } from './buys.controller';
import { CreateBuyDto } from './dto/create-buy.dto';
import { BuysService } from './buys.service';

describe('Buys Controller', () => {
  let controller: BuysController;
  let service: BuysService;
  const createBuyDto: CreateBuyDto = {
    name: 'Buy #1',
    breed: 'Breed #1',
    age: 4,
  };

  const mockBuy = {
    name: 'Buy #1',
    breed: 'Breed #1',
    age: 4,
    _id: 'a id',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BuysController],
      providers: [
        {
          provide: BuysService,
          useValue: {
            findAll: jest.fn().mockResolvedValue([
              {
                name: 'Buy #1',
                breed: 'Bread #1',
                age: 4,
              },
              {
                name: 'Buy #2',
                breed: 'Breed #2',
                age: 3,
              },
              {
                name: 'Buy #3',
                breed: 'Breed #3',
                age: 2,
              },
            ]),
            create: jest.fn().mockResolvedValue(createBuyDto),
          },
        },
      ],
    }).compile();

    controller = module.get<BuysController>(BuysController);
    service = module.get<BuysService>(BuysService);
  });

  describe('create()', () => {
    it('should create a new buy', async () => {
      const createSpy = jest
        .spyOn(service, 'create')
        .mockResolvedValueOnce(mockBuy);

      await controller.create(createBuyDto);
      expect(createSpy).toHaveBeenCalledWith(createBuyDto);
    });
  });

  describe('findAll()', () => {
    it('should return an array of buys', async () => {
      expect(controller.findAll()).resolves.toEqual([
        {
          name: 'Buy #1',
          breed: 'Bread #1',
          age: 4,
        },
        {
          name: 'Buy #2',
          breed: 'Breed #2',
          age: 3,
        },
        {
          name: 'Buy #3',
          breed: 'Breed #3',
          age: 2,
        },
      ]);
      expect(service.findAll).toHaveBeenCalled();
    });
  });
});
