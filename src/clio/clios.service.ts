import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ethers, Wallet } from 'ethers';
import { Model, Types } from 'mongoose';
import { createOpenAiInstance } from './createOpenAiInstance';
import { CreateClioDto } from './dto/create-clio.dto';
import { RequestClioResponseDto } from './dto/request-clio-response.dto';
import { RequestClioDto } from './dto/request-clio.dto';
import { Clio, ClioDocument, } from './schemas/clio.schema';
import * as paymentContractAbi from '../abis/payment.json';
import { ClioGateway } from './clios.gateway';

@Injectable()
export class CliosService {
  constructor(
    @InjectModel(Clio.name) private readonly clioModel: Model<ClioDocument>,
    private clioGateway: ClioGateway,
    private configService: ConfigService
  ) {
    if (paymentContractAbi) {
      const isMainnet = this.configService.get('IS_MAINNET') == 'true';
      const bscRpcUrl = isMainnet ? this.configService.get('BSC_MAINNET_RPC') : this.configService.get('BSC_TESTNET_RPC');
      const paymentContractInBsc = isMainnet ? this.configService.get('CLIO_PAYMENT_CONTRACT_IN_BSC_MAINNET') : this.configService.get('CLIO_PAYMENT_CONTRACT_IN_BSC_TESTNET');
      // const tokenContractInBsc = isMainnet ? this.configService.get('CLIO_PAYMENT_TOKEN_IN_BSC_MAINNET') : this.configService.get('CLIO_PAYMENT_TOKEN_IN_BSC_TESTNET');

      console.log("isMainnet: ", isMainnet);
      console.log("bscRpcUrl: ", bscRpcUrl);
      console.log("paymentContractInBsc: ", paymentContractInBsc);

      const provider = new ethers.providers.JsonRpcProvider(bscRpcUrl);
      console.log("provider: ", provider);
      console.log("paymentContractAbi: ", paymentContractAbi);

      const contract = new ethers.Contract(paymentContractInBsc, paymentContractAbi, provider);
      contract.on('TokenSent', (payer: string, amount: ethers.BigNumber, duration: number) => {
        console.log("payer: ", payer);
        console.log("amount: ", ethers.utils.formatEther(amount.toString()));
        console.log("duration: ", Number(duration));

        this.handlePayment(payer, amount, Number(duration));
      })
    }
  }

  async create(createClioDto: CreateClioDto): Promise<Clio> {
    const createdClio = await this.clioModel.create(createClioDto);
    return createdClio;
  }

  async request(requestClioDto: RequestClioDto): Promise<RequestClioResponseDto> {
    let user = await this.clioModel.findOne({ wallet: requestClioDto.wallet }).exec();
    console.log("user ==== : ", user);
    if (user.freeCount >= 1) {
      user.freeCount -= 1;
    } else if (user.clioEndTimestamp < (Date.now() / 1000)) {
      return {
        user: user,
        isSuccess: true,
        domainNames: [],
      };
    }

    user.save();

    let domainNamesAnswer = await this.getDomainNames(requestClioDto.clioQuery);
    let domainNamesWithIndex = domainNamesAnswer.split('\n').filter(item => item != '');
    let domainNames = [];

    domainNamesWithIndex.map((item, index) => {
      const parts = item.split(`${index + 1}.`);
      const partsWithEth = parts[1].split(".");
      const partsWithoutEth = partsWithEth[0];
      domainNames.push(partsWithoutEth);
    });
    console.log("domain names: ", domainNames);

    return {
      user: user,
      isSuccess: true,
      domainNames: domainNames,
    };
  }

  async findAll(): Promise<Clio[]> {
    return await this.clioModel.find().exec();
  }

  async isAlreadySignedUp(wallet: string): Promise<boolean> {
    return await this.clioModel.findOne({ wallet: wallet });
  }

  async getDomainNames(clioQuery: string): Promise<string> {
    const maxTokens = 3000;
    const openai = createOpenAiInstance();

    try {
      const response = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: clioQuery,
        max_tokens: maxTokens,
        temperature: 0,
        top_p: 1,
        frequency_penalty: 0.5,
        presence_penalty: 0,
      });

      if (response.data.choices[0].text) {
        return response.data.choices[0].text;
      }

    } catch (error) {
      if (error.response) {
        console.log(error.response.status);
        console.log(error.response.data);
      } else {
        console.log(error.message);
      }

      return '';
    }
  }

  async handlePayment(payer: string, amount: ethers.BigNumber, duration: number) {
    let user = await this.clioModel.findOne({ wallet: payer }).exec();
    let clioEndTimestamp = user.clioEndTimestamp;
    if (clioEndTimestamp < Math.round(Date.now() / 1000)) {
      user.clioEndTimestamp = Math.round(Date.now() / 1000) + duration;
    } else {
      user.clioEndTimestamp = clioEndTimestamp + duration;
    }

    user.save();

    this.clioGateway.expiredTimestampUpdateNotify(user._id, clioEndTimestamp + duration);
  }
}
