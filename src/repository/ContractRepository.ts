import {ethers} from "ethers";
import {FactoryAbi} from "../contracts/abi/FactoryAbiContract";
import {Web3Repository} from "./Web3Repository";
import {RouterAbi} from "../contracts/abi/RouterAbiContract";
import {Erc20Abi} from "../contracts/abi/Erc20AbiContract";

interface tokenAddressesInterface {
    address:string,
    decimal:number
}

export class ContractRepository {
    public static contractFactory:ethers.Contract;
    public static lastCreatedContract:ethers.Contract;
    public static lastCreatedContractAddress:string;
    public static tokenAddresses: Map<string,tokenAddressesInterface[]> = new Map()
    public static contractRouter:ethers.Contract;
    public static contractUsd:ethers.Contract

    static initialize(factoryAddress:string,routerAddress:string,usdAddress:string,wallet:ethers.Wallet){
        ContractRepository.contractFactory = new ethers.Contract(factoryAddress,FactoryAbi,wallet);
        ContractRepository.contractRouter = new ethers.Contract(routerAddress,RouterAbi,wallet);
        ContractRepository.contractUsd = new ethers.Contract(usdAddress,Erc20Abi,wallet)
    }
}
