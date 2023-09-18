import axios, { AxiosInstance } from 'axios';

import { Service } from 'typedi';

@Service()
export class ChangeNowService {
  private changenow_base_url = 'https://api.changenow.io/v2/';
  private api_key = 'bd8726050688607af32544d5634707f4b4480db9af6f4bda4de1dd02423cefc2';
  private axiosInstance: AxiosInstance;

  constructor() {
    if (!this.axiosInstance) {
      this.axiosInstance = axios.create({
        responseType: 'json',
        baseURL: this.changenow_base_url,
        headers: {
          'x-changenow-api-key': this.api_key,
        },
      });
    }
  }

  public async getFixedEstimatedExchangeAmount(
    fromCurrency: string,
    toCurrency: string,
    fromAmount: number,
    toAmount: number,
    fromNetwork: string,
    toNetwork: string,
    type: 'direct' | 'reverse',
  ) {
    try {
      const rlt = await this.axiosInstance.get(
        `/exchange/estimated-amount?fromCurrency=${fromCurrency}&toCurrency=${toCurrency}&fromAmount=${fromAmount}&toAmount=${toAmount}&fromNetwork=${fromNetwork}&toNetwork=${toNetwork}&flow=fixed-rate&type=${type}&useRateId=false`,
      );
      return rlt.data;
    } catch (err) {
      console.log(err, 'error while estimating exchange amount');
      return false;
    }
  }

  public async createExchange(
    fromCurrency: string,
    toCurrency: string,
    fromAmount: string,
    toAmount: string,
    fromNetwork: string,
    toNetwork: string,
    address: string,
    rateId: string,
  ) {
    try {
      const rlt = await this.axiosInstance.post(`/exchange`, {
        fromCurrency,
        toCurrency,
        fromAmount,
        toAmount,
        fromNetwork,
        toNetwork,
        address,
        type: 'reverse',
        rateId,
      });
      return rlt.data;
    } catch (err) {
      console.log(err, 'error while estimating exchange amount');
      return false;
    }
  }
}
