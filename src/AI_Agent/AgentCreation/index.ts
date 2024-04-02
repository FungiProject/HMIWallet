import { ChatOpenAI } from "@langchain/openai";
import type { ChatPromptTemplate as ChatType } from "@langchain/core/prompts";
import { pull } from "langchain/hub";
import { createOpenAIFunctionsAgent } from "langchain/agents";
import { dynamicTools } from "../Tools/DynamicTool";
import dotenv from "dotenv";
import { AgentExecutor } from "langchain/agents";
import { HumanMessage, AIMessage, SystemMessage } from "@langchain/core/messages";

dotenv.config();

const llm = new ChatOpenAI({
  modelName: "gpt-3.5-turbo",
  temperature: 0,
  openAIApiKey: "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",
});

export const tools = dynamicTools;

const prompt = await pull<ChatType>(
  "hwchase17/openai-functions-agent"
);

export const agent = await createOpenAIFunctionsAgent({
  llm,
  tools,
  prompt,
});

export const agentExecutor = new AgentExecutor({
  agent,
  tools,
  verbose: true,
});

// A function for executing the agent
export const executeAgent = async (query: string, date: string, portfolio: string, scaAddress: string | undefined) => {
  let response = await agentExecutor.invoke(
    {
      input: query,
      chat_history: [
        new SystemMessage(`Portfolio composition:\n\nDate: ${date}\n\nPortfolio: ${portfolio}\n\nSource address: ${scaAddress} \n\nUSDC: 0xaf88d065e77c8cc2239327c5edb3a432268e5831, DAI: 0xda10009cbd5d07dd0cecc66161fc93d7c9000da1, WETH: 0x82af49447d8a07e3bd95bd0d56f35241523fbab1 ARB: 0x912ce59144191c1204e64559fe8253a0e49e6548\n\nQuery: ${query}`),
        new AIMessage("What is my purpose?"),
        new SystemMessage("You are an AI Agent created to assist with decentralized finance operations. You have a number of tools that allows you to perform various operations through a Smart Contract Account. You will receive queries from users and provide them with the necessary information to execute their operations."),
      ],
    },
    {
      // This is needed because in most real world scenarios, a session id is needed per user.
      // It isn't really used here because we are using a simple in memory ChatMessageHistory.
      configurable: {
        sessionId: "foo",
      },
    }
  );
  return response;
};
