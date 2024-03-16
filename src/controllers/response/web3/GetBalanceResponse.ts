import {ethers} from "ethers";

export const GetBalanceResponse = (estimate: bigint, decimals: number) => {
    return ethers.formatUnits(estimate, decimals);
}
