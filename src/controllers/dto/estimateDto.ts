import {ethers} from "ethers";
import {ContractRepository} from "../../repository/ContractRepository";
import {Web3Repository} from "../../repository/Web3Repository";

export const estimateDto = async (arg:string) => {
    const args:string[] = arg.split(" ")

    if(args.length == 0) throw new Error("missing arguments");

    const functionName = args[0]
    const contractAddress:string = args[1]

    if(!ethers.isAddress(contractAddress)) throw new Error("invalid address")

    return {
        functionName,
        contractAddress
    }
}
