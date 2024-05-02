import React, { useState, useEffect } from 'react';
import PageContainer from '@/components/Container/PageContainer';
import { useTokensInfo } from '@/hooks/useTokensInfo';
import { generateQueryFromPortfolio } from '../../../../AI_Agent/Utils/generateQueryFromPortfolio';
import useScAccountPositions from "@/domain/position/useScAccountPositions";
import useScAccountSpotPosition from "@/domain/position/useScAccountSpotPosition";
import Secondary from "./sidebar";

import { agentCommunicationChannel, EVENT_TYPES } from '@/AI_Agent/AgentCommunicationChannel';
import useWallet from "@/hooks/useWallet";
import { useLiFiTx, useSimulateTransfer, useSimLiFiTx, useHandleSend, useLiFiBatch, useMind } from '@/AI_Agent/hooks';
import { TokenInfo } from '@/domain/tokens/types';
import { useChatHistory } from '@/AI_Agent/Context/ChatHistoryContext';
import ChatDisplay from '@/AI_Agent/ChatDisplay';
import { BaseMessage } from '@langchain/core/messages';
import  { UserInput }   from '@/components/TextInputs/UserInput';
import ConfirmationBoxSwap from '@/components/Cards/ChatConfirmations/ConfirmationBoxSwap';
import ConfirmationBoxSimple from '@/components/Cards/ChatConfirmations/ConfirmationBoxSimple';
import ConfirmationBoxBatch from '@/components/Cards/ChatConfirmations/ConfirmationBoxBatch';
import { useConfirmation, ConfirmationType } from '@/AI_Agent/hooks/useConfirmation';

import dotenv from "dotenv";
import { ConfirmationManager } from '@/AI_Agent/ConfirmationManager/ConfirmationManager';
import { useToolRequestListener } from '@/AI_Agent/hooks/useToolRequestListener';

dotenv.config();

const AgentChat = () => {
    const { processChatMessage } = useMind();
    const { getHistory } = useChatHistory();
    const [chatHistory, setChatHistory] = useState<BaseMessage[]>([]);
    const [tokenAddress, setTokenAddress] = useState<string>("0xaf88d065e77c8cc2239327c5edb3a432268e5831");
    const [amount, setAmount] = useState<string>("1000000");
    const [recipient, setRecipient] = useState<string>("0x141571912eC34F9bE50a6b8DC805e71Df70fAdAD");
    const { tokens } = useTokensInfo();
    const [query, setQuery] = useState<string>("");
    const [agentResponse, setAgentResponse] = useState<string>("");
    const { simulationResult, simulateTransfer } = useSimulateTransfer();
    const [simStatus, setSimStatus] = useState<{ success: boolean }>({ success: false });
    const { updatedSendTransfer, handleSend } = useHandleSend();
    const { status, simLiFiTx, quote, getQuote, extractConfirmationDetails } = useSimLiFiTx();
    const { sendLiFiTx } = useLiFiTx();
    const { addToBatch, batchedOperations, executeBatchOperations } = useLiFiBatch();
    const { totalBalance } = useScAccountPositions();
    const { totalCash } = useScAccountSpotPosition();
    const [length, setLength] = useState(tokens.length);
    const [tokenFrom, setTokenFrom] = useState<TokenInfo | undefined>();
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [forceTableReload, setForceTableReload] = useState(false);
    const [isInputEmpty, setIsInputEmpty] = useState(true);
    // const { fetchActivities, fetchedData } = useRSS3Activities();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { scAccount } = useWallet();
    const [readyForTransfer, setReadyForTransfer] = useState(false);
    const {
        confirmationDetails, setConfirmationDetails, 
        isConfirmed, setIsConfirmed, 
        showConfirmationBox, setShowConfirmationBox, 
        confirmAction, rejectAction
    } = useConfirmation();

    useToolRequestListener({ setConfirmationDetails, setParams: null, setShowConfirmationBox });
    
    const getCurrentDate = () => {
        return new Date().toISOString();
    };

    const handleQuerySubmit = async (query: string) => {
        if (tokens.length > 0 && query.trim() !== "") {
            const portfolioQuery = generateQueryFromPortfolio(tokens);
            const date = getCurrentDate();
            const portfolio = portfolioQuery;
            const scaAddress = scAccount;

            try {
                // Call Mind's processChatMessage and await its response
                const response = await processChatMessage(query, date, portfolio, scaAddress);
                // Directly set the response as the agent's response
                setAgentResponse(response);
            } catch (error) {
                console.error("Error processing chat message:", error);
            }

            setQuery(""); // Clear the text input box after processing
            setIsInputEmpty(true); // Reset input validation state
        }
    };

    const formatCurrency = (value: number | bigint) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
    };

    useEffect(() => {
        setTokenAddress(tokenAddress);
        setAmount(amount);
        setRecipient(recipient);
    }, [tokenAddress, amount, recipient]);

    useEffect(() => {
        const updateChatHistory = async () => {
            const history: BaseMessage[] = await getHistory();
            setChatHistory(history);
        };

        updateChatHistory();
    }, [getHistory]);

    const getLength = (length: number) => {
        setLength(length);
    };

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
    };

    const ITEMS_PER_PAGE = 6;

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, length);

    return (
        <main>
          <PageContainer
            main={
                <div className="flex flex-col items-center justify-end pb-0 p-4 rounded-lg shadow-sm">
                    <ChatDisplay chatHistory={chatHistory} />
                    {/* {renderConfirmationButtons()} */}
                    <ConfirmationManager
                            confirmationDetails={confirmationDetails}
                            confirmAction={confirmAction}
                            rejectAction={rejectAction}
                            showConfirmationBox={showConfirmationBox}
                        />
                    <UserInput onSubmit={handleQuerySubmit} />
                </div>
            }
            secondary={
              <Secondary
                totalBalance={totalBalance}
                totalCash={totalCash}
                tokens={tokens}
                formatCurrency={formatCurrency}
                startIndex={startIndex}
                endIndex={endIndex}
                getLength={getLength}
                handlePageChange={handlePageChange}
                setTokenFrom={setTokenFrom}
                forceTableReload={forceTableReload}
                currentPage={currentPage}
                ITEMS_PER_PAGE={ITEMS_PER_PAGE}
                length={length}
                onModalToggle={setIsModalOpen}
              />
            }
            page="AI Agent Tester"
            keepWorkingMessage={null}
            isModalOpen={isModalOpen}
          />
        </main>
      );
};

export default AgentChat;
