import { Test, TestingModule } from '@nestjs/testing';
import { WhitelistsService } from './whitelists.service';
import { getModelToken } from '@nestjs/mongoose';
import { Whitelist } from './schemas/whitelist.schema';
import { Model } from 'mongoose';

const mockWhitelist = {
  name: 'Whitelist #1',
  breed: 'Breed #1',
  age: 4,
};

describe('WhitelistsService', () => {
  let service: WhitelistsService;
  let model: Model<Whitelist>;

  const whitelistsArray = [
    {
      name: 'Whitelist #1',
      breed: 'Breed #1',
      age: 4,
    },
    {
      name: 'Whitelist #2',
      breed: 'Breed #2',
      age: 2,
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WhitelistsService,
        {
          provide: getModelToken('Whitelist'),
          useValue: {
            new: jest.fn().mockResolvedValue(mockWhitelist),
            constructor: jest.fn().mockResolvedValue(mockWhitelist),
            find: jest.fn(),
            create: jest.fn(),
            exec: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<WhitelistsService>(WhitelistsService);
    model = module.get<Model<Whitelist>>(getModelToken('Whitelist'));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return all whitelists', async () => {
    jest.spyOn(model, 'find').mockReturnValue({
      exec: jest.fn().mockResolvedValueOnce(whitelistsArray),
    } as any);
    const whitelists = await service.findAll();
    expect(whitelists).toEqual(whitelistsArray);
  });

  it('should insert a new whitelist', async () => {
    jest.spyOn(model, 'create').mockImplementationOnce(() =>
      Promise.resolve({
        name: 'Whitelist #1',
        breed: 'Breed #1',
        age: 4,
      }),
    );
    const newWhitelist = await service.create({
      name: 'Whitelist #1',
      breed: 'Breed #1',
      age: 4,
    });
    expect(newWhitelist).toEqual(mockWhitelist);
  });
});
