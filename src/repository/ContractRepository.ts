import {ethers} from "ethers";
import {FactoryAbi} from "../contracts/abi/FactoryAbiContract";

export class ContractRepository {
    public static contractFactory:ethers.Contract;
    public static lastCreatedContract:ethers.Contract;
    public static lastCreatedContractAddress:string;

    static initialize(factory_address:string,wallet:ethers.Wallet){
        console.log("[Initializing] ContractRepository")

        ContractRepository.contractFactory = new ethers.Contract(factory_address,FactoryAbi,wallet);
    }
}
