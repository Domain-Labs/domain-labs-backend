import { Test, TestingModule } from '@nestjs/testing';
import { AccessesService } from './accesses.service';
import { getModelToken } from '@nestjs/mongoose';
import { Access } from './schemas/access.schema';
import { Model } from 'mongoose';

const mockAccess = {
  name: 'Access #1',
  breed: 'Breed #1',
  age: 4,
};

describe('AccessesService', () => {
  let service: AccessesService;
  let model: Model<Access>;

  const accessesArray = [
    {
      name: 'Access #1',
      breed: 'Breed #1',
      age: 4,
    },
    {
      name: 'Access #2',
      breed: 'Breed #2',
      age: 2,
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccessesService,
        {
          provide: getModelToken('Access'),
          useValue: {
            new: jest.fn().mockResolvedValue(mockAccess),
            constructor: jest.fn().mockResolvedValue(mockAccess),
            find: jest.fn(),
            create: jest.fn(),
            exec: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AccessesService>(AccessesService);
    model = module.get<Model<Access>>(getModelToken('Access'));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return all accesses', async () => {
    jest.spyOn(model, 'find').mockReturnValue({
      exec: jest.fn().mockResolvedValueOnce(accessesArray),
    } as any);
    const accesses = await service.findAll();
    expect(accesses).toEqual(accessesArray);
  });

  it('should insert a new access', async () => {
    jest.spyOn(model, 'create').mockImplementationOnce(() =>
      Promise.resolve({
        name: 'Access #1',
        breed: 'Breed #1',
        age: 4,
      }),
    );
    const newAccess = await service.create({
      name: 'Access #1',
      breed: 'Breed #1',
      age: 4,
    });
    expect(newAccess).toEqual(mockAccess);
  });
});
