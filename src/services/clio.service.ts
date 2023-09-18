import { Connection } from '@solana/web3.js';
import { HttpException } from '@/exceptions/httpException';
import OpenAI from 'openai';
import { Service } from 'typedi';
import clioModel from '@/models/clio.model';
import { ethers } from 'ethers';

@Service()
export class ClioService {
  private openaiSecretKey = '';
  private clios = clioModel;
  private openai = new OpenAI({
    apiKey: this.openaiSecretKey,
  });
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public async search(sentence: string, token: string): Promise<void> {
    const maxTokens = 8000;
    const rlt = await this.clios.findOne({
      token: token,
    });
    console.log(rlt);
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        ...rlt.messages,
        {
          role: 'user',
          content: `I need blockchain domain solutions. ${sentence}. How can I name that domains? please give me domain names`,
        },
      ],
      max_tokens: maxTokens,
      temperature: 0,
      top_p: 1,
      frequency_penalty: 0.5,
      presence_penalty: 0,
    });
    if (rlt) {
      rlt.messages.push({
        role: 'user',
        content: `I need blockchain domain solutions. ${sentence}. How can I name that domain? please give me domain names`,
      });
      rlt.messages.push(response.choices[0].message);
      await clioModel.updateOne(
        {
          token: token,
        },
        {
          $set: {
            token: token,
            messages: rlt.messages,
          },
        },
      );
    } else {
      await clioModel.create({
        token: token,
        messages: [
          {
            role: 'user',
            content: `I need blockchain domain solutions. ${sentence}. How can I name that domain? please give me domain names`,
          },
          {
            ...response.choices[0].message,
          },
        ],
      });
    }
  }
}
