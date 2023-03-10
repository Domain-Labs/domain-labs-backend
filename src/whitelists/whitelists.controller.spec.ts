import { Test, TestingModule } from '@nestjs/testing';
import { WhitelistsController } from './whitelists.controller';
import { CreateWhitelistDto } from './dto/create-whitelist.dto';
import { WhitelistsService } from './whitelists.service';

describe('Whitelists Controller', () => {
  let controller: WhitelistsController;
  let service: WhitelistsService;
  const createWhitelistDto: CreateWhitelistDto = {
    name: 'Whitelist #1',
    breed: 'Breed #1',
    age: 4,
  };

  const mockWhitelist = {
    name: 'Whitelist #1',
    breed: 'Breed #1',
    age: 4,
    _id: 'a id',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WhitelistsController],
      providers: [
        {
          provide: WhitelistsService,
          useValue: {
            findAll: jest.fn().mockResolvedValue([
              {
                name: 'Whitelist #1',
                breed: 'Bread #1',
                age: 4,
              },
              {
                name: 'Whitelist #2',
                breed: 'Breed #2',
                age: 3,
              },
              {
                name: 'Whitelist #3',
                breed: 'Breed #3',
                age: 2,
              },
            ]),
            create: jest.fn().mockResolvedValue(createWhitelistDto),
          },
        },
      ],
    }).compile();

    controller = module.get<WhitelistsController>(WhitelistsController);
    service = module.get<WhitelistsService>(WhitelistsService);
  });

  describe('create()', () => {
    it('should create a new whitelist', async () => {
      const createSpy = jest
        .spyOn(service, 'create')
        .mockResolvedValueOnce(mockWhitelist);

      await controller.create(createWhitelistDto);
      expect(createSpy).toHaveBeenCalledWith(createWhitelistDto);
    });
  });

  describe('findAll()', () => {
    it('should return an array of whitelists', async () => {
      expect(controller.findAll()).resolves.toEqual([
        {
          name: 'Whitelist #1',
          breed: 'Bread #1',
          age: 4,
        },
        {
          name: 'Whitelist #2',
          breed: 'Breed #2',
          age: 3,
        },
        {
          name: 'Whitelist #3',
          breed: 'Breed #3',
          age: 2,
        },
      ]);
      expect(service.findAll).toHaveBeenCalled();
    });
  });
});
