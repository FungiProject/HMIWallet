import React, { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";

const TxSummaryHeader = ({
    isExpanded,
    handleArrowClick,
    amountToSwap,
    amountToReceive,
    tokenInSymbol,
    tokenOutSymbol,
    tokenInLogo,
    tokenOutLogo,
    gasCost,
    tokenInDecimals,
    tokenOutDecimals,
}) => {
    // Ensure proper conversion to numbers before formatting
    const formattedAmountToSwap =
        (Number(amountToSwap) || 0) / Math.pow(10, tokenInDecimals || 0);
    const formattedAmountToReceive = (
        (Number(amountToReceive) || 0) / Math.pow(10, tokenOutDecimals || 0)
    ).toFixed(3);

    const totalCost = (Number(gasCost) || 0).toFixed(2); // Properly format costs
    console.log("Total Cost:", totalCost);

    return (
        <div className="flex justify-between items-center h-[38px] rounded-full bg-white w-full">
            <div className="flex items-center p-[15px] pl-5">
                {tokenInLogo && (
                    <Image
                        src={tokenInLogo}
                        width={20}
                        height={20}
                        alt={tokenInSymbol}
                        className="mr-2"
                    />
                )}
                <p className="text-light mr-2">
                    {formattedAmountToSwap} {tokenInSymbol} for{" "}
                    {formattedAmountToReceive} {tokenOutSymbol}
                </p>
                {tokenOutLogo && (
                    <Image
                        src={tokenOutLogo}
                        width={20}
                        height={20}
                        alt={tokenOutSymbol}
                        className="mr-2"
                    />
                )}
            </div>

            {/* 
            <p>
                <span>Gas is covered by Fungi</span>
            </p> */}
            {/* <p><span>${totalCost}</span></p> */}
            <div
                className="cursor-pointer pr-[15px] flex items-center justify-center flex-row"
                onClick={handleArrowClick}
            >
                <Image
                    src="/GasStation.svg"
                    width={20}
                    height={20}
                    alt="Gas Station"
                />
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-6 w-6 transform ${isExpanded ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                    />
                </svg>
            </div>
        </div>
    );
};

const TxSummaryDetails = ({ isExpanded, tool, gasCost, maxSlippage }) => {
    const networkCost = (Number(gasCost) || 0).toFixed(2); // Format network cost

    return (
        <AnimatePresence mode="wait">
            {isExpanded && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="w-[454px] border-gray-300 pt-4 bg-white h-[129px] rounded-[20px]"
                >
                    <div className="flex justify-between pl-[15px] pr-[15px]">
                        <span>Tool</span>
                        <span>{tool}</span>
                    </div>
                    <div className="flex justify-between pl-[15px] pr-[15px] pt-3">
                        <span>Network Cost</span>
                        {/* <span>${gasCost}</span> */}
                        <span>Gas is covered by Fungi</span>
                    </div>
                    <div className="flex justify-between pl-[15px] pr-[15px] pt-3">
                        <span>Max Slippage</span>
                        <span>{maxSlippage}%</span>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

const TxSummary = ({
    amountToSwap,
    amountToReceive,
    tokenInSymbol,
    tokenOutSymbol,
    tokenInLogo,
    tokenOutLogo,
    tool,
    gasCost,
    maxSlippage,
    tokenInDecimals,
    tokenOutDecimals,
}) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const handleArrowClick = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <div className="w-[454px]">
            <TxSummaryHeader
                isExpanded={isExpanded}
                handleArrowClick={handleArrowClick}
                amountToSwap={amountToSwap}
                amountToReceive={amountToReceive}
                tokenInSymbol={tokenInSymbol}
                tokenOutSymbol={tokenOutSymbol}
                tokenInLogo={tokenInLogo}
                tokenOutLogo={tokenOutLogo}
                gasCost={gasCost}
                tokenInDecimals={tokenInDecimals}
                tokenOutDecimals={tokenOutDecimals}
            />
            <br />
            <TxSummaryDetails
                isExpanded={isExpanded}
                tool={tool}
                gasCost={gasCost}
                maxSlippage={maxSlippage}
            />
        </div>
    );
};

export default TxSummary;
