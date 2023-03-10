import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BuyGraphTimePeriod } from 'src/buys/schemas/buy.schema';
import { CreateWhitelistDto } from './dto/create-whitelist.dto';
import { Whitelist, WhitelistDocument } from './schemas/whitelist.schema';

@Injectable()
export class WhitelistsService {
  constructor(
    @InjectModel(Whitelist.name) private readonly whitelistModel: Model<WhitelistDocument>,
  ) { }

  async create(createWhitelistDto: CreateWhitelistDto): Promise<Whitelist> {
    const createdWhitelist = await this.whitelistModel.create(createWhitelistDto);
    return createdWhitelist;
  }

  async findAll(): Promise<Whitelist[]> {
    return await this.whitelistModel.find().exec();
  }

  async getCountsPerPeriod(timePeriod: BuyGraphTimePeriod): Promise<any> {
    console.log("time period: ", timePeriod, "  ,  ", new Date());

    let whitelistInfo = [];
    if (timePeriod == BuyGraphTimePeriod.Day) {
      whitelistInfo = await this.whitelistModel.aggregate([
        {
          $addFields: {
            date: {
              $concat: [
                "$whitelistYear",
                ".",
                "$whitelistMonth",
                ".",
                "$whitelistDate",
              ],
            },
          },
        },
        {
          $project: {
            _id: 0,
            wallet: 1,
            whitelistCount: 1,
            whitelistTime: 1,
            date: 1,
          },
        },
        {
          $group: {
            _id: "$date",
            amountPerDate: {
              $sum: "$whitelistCount",
            },
          },
        },
        {
          $sort: {
            _id: 1,
          },
        },
      ]);
    } else if (timePeriod == BuyGraphTimePeriod.Hour) {
      whitelistInfo = await this.whitelistModel.aggregate([
        {
          $addFields: {
            date: {
              $concat: [
                "$whitelistYear",
                ".",
                "$whitelistMonth",
                ".",
                "$whitelistDate",
                ".",
                "$whitelistHour",
              ],
            },
          },
        },
        {
          $project: {
            _id: 0,
            wallet: 1,
            whitelistCount: 1,
            whitelistTime: 1,
            date: 1,
          },
        },
        {
          $group: {
            _id: "$date",
            amountPerDate: {
              $sum: "$whitelistCount",
            },
          },
        },
        {
          $sort: {
            _id: 1,
          },
        },
      ]);
    } else if (timePeriod == BuyGraphTimePeriod.Month) {
      whitelistInfo = await this.whitelistModel.aggregate([
        {
          $addFields: {
            date: {
              $concat: [
                "$whitelistYear",
                ".",
                "$whitelistMonth",
              ],
            },
          },
        },
        {
          $project: {
            _id: 0,
            wallet: 1,
            whitelistCount: 1,
            whitelistTime: 1,
            date: 1,
          },
        },
        {
          $group: {
            _id: "$date",
            amountPerDate: {
              $sum: "$whitelistCount",
            },
          },
        },
        {
          $sort: {
            _id: 1,
          },
        },
      ]);
    }

    return whitelistInfo;
  }

  async isWhitelist(wallet: string): Promise<boolean> {
    return await this.whitelistModel.findOne({wallet: wallet});
  }
}
