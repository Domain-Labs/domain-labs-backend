import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateBuyDto } from './dto/create-buy.dto';
import { Buy, BuyDocument, BuyGraphTimePeriod } from './schemas/buy.schema';

@Injectable()
export class BuysService {
  constructor(
    @InjectModel(Buy.name) private readonly buyModel: Model<BuyDocument>,
  ) { }

  async create(createBuyDto: CreateBuyDto): Promise<Buy> {
    const createdBuy = await this.buyModel.create(createBuyDto);
    return createdBuy;
  }

  async findAll(): Promise<Buy[]> {
    return await this.buyModel.find().exec();
  }

  async getCountsPerPeriod(timePeriod: BuyGraphTimePeriod): Promise<any> {
    console.log("time period: ", timePeriod);

    let soldInfo = [];
    if (timePeriod == BuyGraphTimePeriod.Day) {
      soldInfo = await this.buyModel.aggregate([
        {
          $addFields: {
            date: {
              $concat: [
                "$buyYear",
                ".",
                "$buyMonth",
                ".",
                "$buyDate",
              ],
            },
          },
        },
        {
          $project: {
            _id: 0,
            wallet: 1,
            buyCount: 1,
            buyMoney: 1,
            buyTime: 1,
            date: 1,
          },
        },
        {
          $group: {
            _id: "$date",
            amountPerDate: {
              $sum: "$buyCount",
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
      soldInfo = await this.buyModel.aggregate([
        {
          $addFields: {
            date: {
              $concat: [
                "$buyYear",
                ".",
                "$buyMonth",
                ".",
                "$buyDate",
                ".",
                "$buyHour",
              ],
            },
          },
        },
        {
          $project: {
            _id: 0,
            wallet: 1,
            buyCount: 1,
            buyMoney: 1,
            buyTime: 1,
            date: 1,
          },
        },
        {
          $group: {
            _id: "$date",
            amountPerDate: {
              $sum: "$buyCount",
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
      soldInfo = await this.buyModel.aggregate([
        {
          $addFields: {
            date: {
              $concat: [
                "$buyYear",
                ".",
                "$buyMonth",
              ],
            },
          },
        },
        {
          $project: {
            _id: 0,
            wallet: 1,
            buyCount: 1,
            buyMoney: 1,
            buyTime: 1,
            date: 1,
          },
        },
        {
          $group: {
            _id: "$date",
            amountPerDate: {
              $sum: "$buyCount",
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

    return soldInfo;
  }

  async getRevenuePerPeriod(timePeriod: BuyGraphTimePeriod): Promise<any> {
    console.log("time period: ", timePeriod);

    let soldInfo = [];
    if (timePeriod == BuyGraphTimePeriod.Day) {
      soldInfo = await this.buyModel.aggregate([
        {
          $addFields: {
            date: {
              $concat: [
                "$buyYear",
                ".",
                "$buyMonth",
                ".",
                "$buyDate",
              ],
            },
          },
        },
        {
          $project: {
            _id: 0,
            wallet: 1,
            buyCount: 1,
            buyMoney: 1,
            buyTime: 1,
            date: 1,
          },
        },
        {
          $group: {
            _id: "$date",
            amountPerDate: {
              $sum: "$buyMoney",
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
      soldInfo = await this.buyModel.aggregate([
        {
          $addFields: {
            date: {
              $concat: [
                "$buyYear",
                ".",
                "$buyMonth",
                ".",
                "$buyDate",
                ".",
                "$buyHour",
              ],
            },
          },
        },
        {
          $project: {
            _id: 0,
            wallet: 1,
            buyCount: 1,
            buyMoney: 1,
            buyTime: 1,
            date: 1,
          },
        },
        {
          $group: {
            _id: "$date",
            amountPerDate: {
              $sum: "$buyMoney",
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
      soldInfo = await this.buyModel.aggregate([
        {
          $addFields: {
            date: {
              $concat: [
                "$buyYear",
                ".",
                "$buyMonth",
              ],
            },
          },
        },
        {
          $project: {
            _id: 0,
            wallet: 1,
            buyCount: 1,
            buyMoney: 1,
            buyTime: 1,
            date: 1,
          },
        },
        {
          $group: {
            _id: "$date",
            amountPerDate: {
              $sum: "$buyMoney",
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

    return soldInfo;
  }
}
