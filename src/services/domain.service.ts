import * as biananceUtils from '@/utils/binance';
import * as ethereumUtils from '@/utils/ethereum';
import * as solanaUtils from '@/utils/solana';

import { BNB_REGISTER_ADDR, ENS_REGISTER_ADDR, SOLANA_KEY, WALLET_KEY } from '@/config';
import { BigNumber, Signer, Transaction, ethers } from 'ethers';
import { CNSEstimatedExchangeAmountResponseType, DomainInputType, DomainStatus, DomainType, EPaymentOptions } from '@interfaces/domain.interface';
import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { getBNBRegisterContract, getENSRegisterContract } from '@/utils/contracts';

import { ChangeNowService } from './changenow.service';
import { Container } from 'typedi';
import { Contract } from 'ethers';
import { HttpException } from '@/exceptions/httpException';
import { Service } from 'typedi';
import axios from 'axios';
import bs58 from 'bs58';
import domainModel from '@/models/domains.model';
import purchaseModel from '@/models/purchase.model';

@Service()
export class DomainService {
  public bscProvider = new ethers.providers.JsonRpcProvider(process.env.BINANCE_RPC_URL);
  public ethProvider = new ethers.providers.AlchemyProvider(1, process.env.ALCHEMY_KEY);
  private ensRegisterController?: Contract;
  private bnbRegisterController?: Contract;
  private connection?: Connection;

  private ethSigner: Signer = new ethers.Wallet(WALLET_KEY, this.ethProvider);
  private bscSigner: Signer = new ethers.Wallet(WALLET_KEY, this.bscProvider);
  private solKeypair = Keypair.fromSecretKey(bs58.decode(SOLANA_KEY));
  public changenow = Container.get(ChangeNowService);

  constructor() {
    this.ensRegisterController = getENSRegisterContract(ENS_REGISTER_ADDR, this.ethProvider);
    this.bnbRegisterController = getBNBRegisterContract(BNB_REGISTER_ADDR, this.bscProvider);
    this.connection = new Connection(process.env.SOLANA_RPC_URL, 'finalized');
  }

  public async checkAvailable(name: string, type: DomainType): Promise<DomainStatus> {
    try {
      if (type === 'SOL') {
        const status = await solanaUtils.checkAvailable(this.connection, name);
        return status;
      } else if (type === 'BNB') {
        const status = await biananceUtils.checkAvailable(this.bscProvider, name);
        return status;
      } else if (type === 'ETH') {
        const status = await ethereumUtils.checkAvailable(this.ethProvider, name);
        return status;
      } else
        return {
          name: '',
          type: 'SOL',
          registered: false,
        };
    } catch (error) {
      console.log(error);
      throw new HttpException(500, 'Internal Server Error');
    }
  }

  public getENSRegisterController() {
    if (!this.ensRegisterController) {
      this.ensRegisterController = getENSRegisterContract(ENS_REGISTER_ADDR, this.ethProvider);
      return this.ensRegisterController as Contract;
    }
    return this.ensRegisterController;
  }

  public getBNBRegisterController() {
    if (!this.bnbRegisterController) {
      this.bnbRegisterController = getBNBRegisterContract(BNB_REGISTER_ADDR, this.bscProvider);
      return this.bnbRegisterController as Contract;
    }
    return this.bnbRegisterController;
  }

  public async getEstimatedPrice(domains: DomainInputType[], paymentOption: string) {
    const templateAddress = '0xDFF130e15225f8D5F3227b76F7Bb41C19577DBd8';
    const templateSolPubKey = new PublicKey('BurUDeKQKrSWW8U8GoHXHfoS6gqDV4VmcyEHUhNTCWJ4');
    const ethDomains = [];
    const bnbDomains = [];
    const solDomains = [];

    for (let i = 0; i < domains.length; i++) {
      const domainInput = domains[i];
      if (domainInput.type === 'ETH') {
        ethDomains.push({
          name: domainInput.name,
          duration: domainInput.duration,
        });
      } else if (domainInput.type === 'BNB') {
        bnbDomains.push({
          name: domainInput.name,
          duration: domainInput.duration,
        });
      } else if (domainInput.type === 'SOL') {
        solDomains.push(domainInput.name);
      }
    }

    const ensPrices = await Promise.all(
      ethDomains.map(domain => ethereumUtils.getRentPrice(domain.name, domain.duration, this.ensRegisterController)),
    );
    const eth = ensPrices.reduce((a, b) => a.add(b));
    const ethInNumber = Math.ceil(eth.div(BigNumber.from(Math.pow(10, 12))).toNumber()) / 1000000;

    const ensNetworkFees = await Promise.all(
      ethDomains.map(domain =>
        ethereumUtils.getNetworkFee(domain.name, templateAddress, domain.duration, this.ethProvider, this.ensRegisterController),
      ),
    );

    const ethFee = ensNetworkFees.reduce((a, b) => a.add(b));
    const ethFeeInNumber = Math.ceil(ethFee.div(BigNumber.from(Math.pow(10, 12))).toNumber()) / 1000000;

    const bnbPrices = await Promise.all(
      bnbDomains.map(domain => biananceUtils.getRentPrice(domain.name, domain.duration, this.bnbRegisterController)),
    );

    const bnb = bnbPrices.reduce((a, b) => a.add(b));
    const bnbInNumber = Math.ceil(bnb.div(BigNumber.from(Math.pow(10, 12))).toNumber()) / 1000000;

    const bnbNetworkFees = await Promise.all(
      bnbDomains.map(domain =>
        biananceUtils.getNetworkFee(domain.name, templateAddress, domain.duration, this.bscProvider, this.bnbRegisterController),
      ),
    );

    const bnbFee = bnbNetworkFees.reduce((a, b) => a.add(b));
    const bnbFeeInNumber = Math.ceil(bnbFee.div(BigNumber.from(Math.pow(10, 12))).toNumber()) / 1000000;

    const solPrices = await solanaUtils.getRentPrice(this.connection, solDomains);
    const solNetworkFees = await solanaUtils.getNetworkFee(this.connection, solDomains, templateSolPubKey);
    let rlt: { price: number; fee: number } = {
      price: 0,
      fee: 0,
    };
    console.log(bnbInNumber, bnbFeeInNumber, ethInNumber, ethFeeInNumber, solPrices, solNetworkFees);
    switch (paymentOption) {
      case EPaymentOptions.BNB:
        rlt = await this.getPriceInBNB(bnbInNumber, bnbFeeInNumber, ethInNumber, ethFeeInNumber, solPrices, solNetworkFees);
        return rlt;
      case EPaymentOptions.ETH:
        rlt = await this.getPriceInETH(bnbInNumber, bnbFeeInNumber, ethInNumber, ethFeeInNumber, solPrices, solNetworkFees);
        return rlt;
      case EPaymentOptions.SOL:
        rlt = await this.getPriceInSOL(bnbInNumber, bnbFeeInNumber, ethInNumber, ethFeeInNumber, solPrices, solNetworkFees);
        return rlt;
      default:
        break;
    }
  }

  public async getTokenPrice(ticker: string): Promise<number> {
    const rlt = await axios.get(`https://binance.com/api/v3/ticker/price?symbol=${ticker}`);
    return Number(rlt.data.price);
  }

  public async getPriceInBNB(
    bnb: number,
    bnbFee: number,
    eth: number,
    ethFee: number,
    sol: number,
    solFee: number,
  ): Promise<{ price: number; fee: number }> {
    const [bnbUSDT, ethUSDT, solUSDT] = await Promise.all([
      this.getTokenPrice('BNBUSDT'),
      this.getTokenPrice('ETHUSDT'),
      this.getTokenPrice('SOLUSDT'),
    ]);
    const ethInBnb = (eth * ethUSDT) / bnbUSDT;
    const solInBnb = (sol * solUSDT) / bnbUSDT;

    let totalFee = 0;
    if (eth > 0) {
      const ethEstimation: CNSEstimatedExchangeAmountResponseType = await this.changenow.getFixedEstimatedExchangeAmount(
        'bnb',
        'eth',
        0,
        eth + ethFee,
        'bsc',
        'eth',
        'reverse',
      );
      totalFee += ethEstimation.fromAmount;
    }

    if (sol > 0) {
      const solEstimation: CNSEstimatedExchangeAmountResponseType = await this.changenow.getFixedEstimatedExchangeAmount(
        'bnb',
        'sol',
        0,
        sol + solFee / Math.pow(10, 10),
        'bsc',
        'sol',
        'reverse',
      );
      totalFee += solEstimation.fromAmount;
    }

    const totalBnb = bnb + ethInBnb + solInBnb;
    totalFee += bnbFee - ethInBnb - solInBnb;
    return {
      price: totalBnb,
      fee: totalFee,
    };
  }

  public async getPriceInETH(
    bnb: number,
    bnbFee: number,
    eth: number,
    ethFee: number,
    sol: number,
    solFee: number,
  ): Promise<{ price: number; fee: number }> {
    const [bnbUSDT, ethUSDT, solUSDT] = await Promise.all([
      this.getTokenPrice('BNBUSDT'),
      this.getTokenPrice('ETHUSDT'),
      this.getTokenPrice('SOLUSDT'),
    ]);
    const bnbInEth = (bnb * bnbUSDT) / ethUSDT;
    const solInEth = (sol * solUSDT) / ethUSDT;
    let totalFee = 0;
    if (bnb > 0) {
      const ethEstimation: CNSEstimatedExchangeAmountResponseType = await this.changenow.getFixedEstimatedExchangeAmount(
        'eth',
        'bnb',
        0,
        bnb + bnbFee,
        'eth',
        'bsc',
        'reverse',
      );
      totalFee += ethEstimation.fromAmount;
    }

    if (sol > 0) {
      const solEstimation: CNSEstimatedExchangeAmountResponseType = await this.changenow.getFixedEstimatedExchangeAmount(
        'eth',
        'sol',
        0,
        sol + solFee / Math.pow(10, 10),
        'eth',
        'sol',
        'reverse',
      );
      totalFee += solEstimation.fromAmount;
    }

    const total = eth + bnbInEth + solInEth;
    totalFee += ethFee - bnbInEth - solInEth;
    return {
      price: total,
      fee: totalFee,
    };
  }

  public async getPriceInSOL(
    bnb: number,
    bnbFee: number,
    eth: number,
    ethFee: number,
    sol: number,
    solFee: number,
  ): Promise<{ price: number; fee: number }> {
    const [bnbUSDT, ethUSDT, solUSDT] = await Promise.all([
      this.getTokenPrice('BNBUSDT'),
      this.getTokenPrice('ETHUSDT'),
      this.getTokenPrice('SOLUSDT'),
    ]);
    const bnbInSOL = (bnb * bnbUSDT) / solUSDT;
    const ethInSOL = (eth * ethUSDT) / solUSDT;
    let totalFee = 0;
    if (bnb > 0) {
      const bnbEstimation: CNSEstimatedExchangeAmountResponseType = await this.changenow.getFixedEstimatedExchangeAmount(
        'sol',
        'bnb',
        0,
        bnb + bnbFee,
        'sol',
        'bsc',
        'reverse',
      );
      totalFee += bnbEstimation.fromAmount;
    }

    if (eth > 0) {
      const ethEstimation: CNSEstimatedExchangeAmountResponseType = await this.changenow.getFixedEstimatedExchangeAmount(
        'sol',
        'eth',
        0,
        eth + ethFee / Math.pow(10, 10),
        'sol',
        'eth',
        'reverse',
      );
      totalFee += ethEstimation.fromAmount;
    }

    const total = sol + bnbInSOL + ethInSOL;
    totalFee += solFee - bnbInSOL - ethInSOL;
    return {
      price: total,
      fee: totalFee,
    };
  }
  // public async getDomainLabsFee(domains: DomainInputType[], paymentOption: string): Promise<void> {
  //   domains.map((domain: DomainInputType) => {
  //     if (domain.type !== 'SOL') {
  //       if (domain.name.length >= 5) {
  //         //1 usd fee
  //       } else {
  //         //10% fee
  //       }
  //     }
  //   });
  // }

  public async saveDomainsIntoDB(domains: DomainInputType[], paymentOption: string, address: string, solAddress: string): Promise<string> {
    const estimationObj = await this.getEstimatedPrice(domains, paymentOption);
    const purchase = await purchaseModel.create({
      domains: domains,
      address: address,
      solAddress: solAddress,
      estimationAmount: estimationObj.price + estimationObj.fee,
    });
    return purchase.id;
  }

  public async confirmTransaction(id: string, transactionHash: string): Promise<Boolean> {
    const purchase = await purchaseModel.findOne({
      id: id,
    });
    const duplicationExist = await purchaseModel.findOne({
      transaction: transactionHash,
    });
    if (duplicationExist) return false;
    switch (purchase.paymentOption) {
      case EPaymentOptions.BNB:
      case EPaymentOptions.ETH:
        // await this.ethProvider.getTransactionReceipt(transaction).then(rlt => {
        //   console.log(rlt);
        // });
        let transaction: Transaction;
        const toAddr = await this.ethSigner.getAddress();
        if (purchase.paymentOption === EPaymentOptions.BNB) {
          transaction = await this.bscProvider.getTransaction(transactionHash);
        } else {
          transaction = await this.ethProvider.getTransaction(transactionHash);
        }

        const amountReceived = transaction.value.div(BigNumber.from(Math.pow(10, 12))).toNumber() / 100000;
        //check the transaction if it is already used

        if (purchase.estimationAmount === amountReceived && transaction.to === toAddr) {
          await purchaseModel.updateOne(
            {
              id: id,
            },
            {
              $set: {
                transaction: transactionHash,
              },
            },
          );
          return true;
        } else return false;

      case EPaymentOptions.SOL:
        const parsedTx = await this.connection.getParsedTransaction(transactionHash);
        // const fromPubKey = parsedTx.transaction.message.accountKeys[0];
        const toPubKey = parsedTx.transaction.message.accountKeys[1];
        const chargedBalance = parsedTx.meta.postBalances[1] - parsedTx.meta.preBalances[1]; //current balance
        if (this.solKeypair.publicKey === toPubKey.pubkey && chargedBalance >= purchase.estimationAmount * Math.pow(10, 9)) {
          await purchaseModel.updateOne(
            {
              id: id,
            },
            {
              $set: {
                transaction: transactionHash,
              },
            },
          );
          return true;
        } else return false;
    }
  }

  public async registerDomains(purchaseId: string) {
    const purchase = await purchaseModel.findOne({
      id: purchaseId,
    });
    const domains = purchase.domains;
    const address = purchase.address;
    const solAddress = purchase.solAddress;
    const failed: DomainInputType[] = [];
    for (let i = 0; i < domains.length; i++) {
      const domain = domains[i];
      try {
        if (domain.type === 'BNB') {
          await biananceUtils.register(domain.name, address, domain.duration, this.bscProvider, this.bnbRegisterController, this.bscSigner);
        } else if (domain.type === 'ETH') {
          await ethereumUtils.register(domain.name, address, domain.duration, this.ethProvider, this.ensRegisterController, this.ethSigner);
        } else if (domain.type === 'SOL') {
          await solanaUtils.register(this.connection, [domain.name], new PublicKey(solAddress), this.solKeypair);
        }
        //save registered domains into database
        await domainModel.create({
          label: domain.name,
          duration: domain.duration,
          type: domain.type,
          address: address,
          solAddress: solAddress,
          created: Date.now(),
        });
      } catch (err) {
        console.log(err);
        failed.push({
          ...domain,
          reason: err,
        });
        //save unregistered domains into database
      }
    }
    await purchaseModel.updateOne(
      { id: purchaseId },
      {
        $set: {
          purchased: true,
          failed: failed,
        },
      },
    );
  }
}
