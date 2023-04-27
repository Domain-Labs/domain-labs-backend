import { Configuration, OpenAIApi } from 'openai'

export const createOpenAiInstance = () => {
    const configuration = new Configuration({
        apiKey: process.env.OPENAI_API_KEY,
    });

    return new OpenAIApi(configuration);
};
