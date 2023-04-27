import { Test, TestingModule } from '@nestjs/testing';
import { CliosService } from './clios.service';
import { getModelToken } from '@nestjs/mongoose';
import { Clio } from './schemas/clio.schema';
import { Model } from 'mongoose';

const mockClio = {
  name: 'Clio #1',
  breed: 'Breed #1',
  age: 4,
};

describe('CliosService', () => {
  let service: CliosService;
  let model: Model<Clio>;

  const cliosArray = [
    {
      name: 'Clio #1',
      breed: 'Breed #1',
      age: 4,
    },
    {
      name: 'Clio #2',
      breed: 'Breed #2',
      age: 2,
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CliosService,
        {
          provide: getModelToken('Clio'),
          useValue: {
            new: jest.fn().mockResolvedValue(mockClio),
            constructor: jest.fn().mockResolvedValue(mockClio),
            find: jest.fn(),
            create: jest.fn(),
            exec: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CliosService>(CliosService);
    model = module.get<Model<Clio>>(getModelToken('Clio'));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return all clios', async () => {
    jest.spyOn(model, 'find').mockReturnValue({
      exec: jest.fn().mockResolvedValueOnce(cliosArray),
    } as any);
    const clios = await service.findAll();
    expect(clios).toEqual(cliosArray);
  });

  it('should insert a new clio', async () => {
    jest.spyOn(model, 'create').mockImplementationOnce(() =>
      Promise.resolve({
        name: 'Clio #1',
        breed: 'Breed #1',
        age: 4,
      }),
    );
    const newClio = await service.create({
      name: 'Clio #1',
      breed: 'Breed #1',
      age: 4,
    });
    expect(newClio).toEqual(mockClio);
  });
});
