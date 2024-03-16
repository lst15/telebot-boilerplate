import {ethers} from "ethers";

export const EstimateDeployResponse = (estimate: bigint, decimals: number) => {
    return ethers.formatUnits(estimate, decimals);
}
