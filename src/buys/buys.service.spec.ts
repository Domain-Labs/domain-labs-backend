import { Test, TestingModule } from '@nestjs/testing';
import { BuysService } from './buys.service';
import { getModelToken } from '@nestjs/mongoose';
import { Buy } from './schemas/buy.schema';
import { Model } from 'mongoose';

const mockBuy = {
  name: 'Buy #1',
  breed: 'Breed #1',
  age: 4,
};

describe('BuysService', () => {
  let service: BuysService;
  let model: Model<Buy>;

  const buysArray = [
    {
      name: 'Buy #1',
      breed: 'Breed #1',
      age: 4,
    },
    {
      name: 'Buy #2',
      breed: 'Breed #2',
      age: 2,
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BuysService,
        {
          provide: getModelToken('Buy'),
          useValue: {
            new: jest.fn().mockResolvedValue(mockBuy),
            constructor: jest.fn().mockResolvedValue(mockBuy),
            find: jest.fn(),
            create: jest.fn(),
            exec: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<BuysService>(BuysService);
    model = module.get<Model<Buy>>(getModelToken('Buy'));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return all buys', async () => {
    jest.spyOn(model, 'find').mockReturnValue({
      exec: jest.fn().mockResolvedValueOnce(buysArray),
    } as any);
    const buys = await service.findAll();
    expect(buys).toEqual(buysArray);
  });

  it('should insert a new buy', async () => {
    jest.spyOn(model, 'create').mockImplementationOnce(() =>
      Promise.resolve({
        name: 'Buy #1',
        breed: 'Breed #1',
        age: 4,
      }),
    );
    const newBuy = await service.create({
      name: 'Buy #1',
      breed: 'Breed #1',
      age: 4,
    });
    expect(newBuy).toEqual(mockBuy);
  });
});
