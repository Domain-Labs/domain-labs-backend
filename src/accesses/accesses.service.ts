import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BuyGraphTimePeriod } from 'src/buys/schemas/buy.schema';
import { CreateAccessDto } from './dto/create-access.dto';
import { Access, AccessDocument } from './schemas/access.schema';

@Injectable()
export class AccessesService {
  constructor(
    @InjectModel(Access.name) private readonly accessModel: Model<AccessDocument>,
  ) { }

  async create(createAccessDto: CreateAccessDto): Promise<Access> {
    const createdAccess = await this.accessModel.create(createAccessDto);
    return createdAccess;
  }

  async findAll(): Promise<Access[]> {
    return await this.accessModel.find().exec();
  }

  async getCountsPerPeriod(timePeriod: BuyGraphTimePeriod): Promise<any> {
    console.log("time period: ", timePeriod, "  ,  ", new Date());

    let accessInfo = [];
    if (timePeriod == BuyGraphTimePeriod.Day) {
      accessInfo = await this.accessModel.aggregate([
        {
          $addFields: {
            date: {
              $concat: [
                "$accessYear",
                ".",
                "$accessMonth",
                ".",
                "$accessDate",
              ],
            },
          },
        },
        {
          $project: {
            _id: 0,
            wallet: 1,
            accessCount: 1,
            accessTime: 1,
            date: 1,
          },
        },
        {
          $group: {
            _id: "$date",
            amountPerDate: {
              $sum: "$accessCount",
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
      accessInfo = await this.accessModel.aggregate([
        {
          $addFields: {
            date: {
              $concat: [
                "$accessYear",
                ".",
                "$accessMonth",
                ".",
                "$accessDate",
                ".",
                "$accessHour",
              ],
            },
          },
        },
        {
          $project: {
            _id: 0,
            wallet: 1,
            accessCount: 1,
            accessTime: 1,
            date: 1,
          },
        },
        {
          $group: {
            _id: "$date",
            amountPerDate: {
              $sum: "$accessCount",
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
      accessInfo = await this.accessModel.aggregate([
        {
          $addFields: {
            date: {
              $concat: [
                "$accessYear",
                ".",
                "$accessMonth",
              ],
            },
          },
        },
        {
          $project: {
            _id: 0,
            wallet: 1,
            accessCount: 1,
            accessTime: 1,
            date: 1,
          },
        },
        {
          $group: {
            _id: "$date",
            amountPerDate: {
              $sum: "$accessCount",
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

    return accessInfo;
  }
}
