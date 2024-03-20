import {ethers} from "ethers";

export class Web3Repository {
    public static provider:ethers.JsonRpcProvider | ethers.WebSocketProvider;
    public static wallet:ethers.Wallet;
    public static networkId:bigint;
    public static networkName:string;
    public static networkDecimals:number;
    public static networkRouterAddress:string;
    public static networkBlockscan:string;
    public static networkFactoryAddress:string
    public static wethAddress:string
    public static deadAddress:string
    public static walletAddresses:string[] = []

    static initialize(endpoint: string,decimals:number, networkRouterAddress:string,blockscan:string,factoryAddress:string,wethAddress:string){
        console.log("[Initializing] Web3Repository")

        Web3Repository.deadAddress = "0x000000000000000000000000000000000000dEaD"
        Web3Repository.networkDecimals = decimals
        Web3Repository.networkRouterAddress = networkRouterAddress
        Web3Repository.networkBlockscan = blockscan
        Web3Repository.networkFactoryAddress = factoryAddress
        Web3Repository.wethAddress = wethAddress
        Web3Repository.provider = new ethers.JsonRpcProvider(endpoint);
        Web3Repository.wallet = new ethers.Wallet(process.env.private_key as string, Web3Repository.provider);

        Web3Repository.provider.getNetwork().then((network) => {
            console.log(`[${network.name}] network was selected`)
            Web3Repository.networkId = network.chainId;
            Web3Repository.networkName = network.name;
        })

    }
}
