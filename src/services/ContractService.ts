import {Contract, ethers} from "ethers";
import {Web3Repository} from "../repository/Web3Repository";
import {Erc20Abi} from "../contracts/abi/Erc20AbiContract";
import {Web3Service} from "./Web3Service";
import {ContractRepository} from "../repository/ContractRepository";
import {ContractMethodArgs} from "ethers/src.ts/contract/types";


export class ContractService {
    private readonly web3Service:Web3Service = new Web3Service();

    private async getContractTransaction(functionName:string,retries:number,thrownable:boolean,contract:ethers.Contract,...args: ContractMethodArgs<any>){
        let tries = 0
        let lastMessageError = ""

        while (tries < retries) {
            try {
                return await contract.getFunction(functionName).call(null,...args);
            } catch (e) {
                // @ts-ignore
                console.log(e.message + " on getContractTransaction")
                // @ts-ignore
                lastMessageError = e.shortMessage;
            }
            await new Promise((r) => setTimeout(r, 3000));
            tries += 1;
        }
        if(thrownable) throw new Error("error on call " + functionName + " in " + await contract.getAddress() + "\n\n" + lastMessageError);
    }

    public initializeNetworkContract(){
        if(!ContractRepository.tokenAddresses.get(Web3Repository.networkName)) {
            ContractRepository.tokenAddresses.set(Web3Repository.networkName,[])
        }
    }

    public listContractTokensInRepository(){
        this.initializeNetworkContract()
        console.log( ContractRepository.tokenAddresses.get(Web3Repository.networkName))

        return ContractRepository.tokenAddresses.get(Web3Repository.networkName)?.map(token => token.address)
    }

    public addContractTokenInRepository(tokenAddress:string,decimal:number){
        this.initializeNetworkContract()
        if(!ethers.isAddress(tokenAddress)) throw new Error("invalid address")
        ContractRepository.tokenAddresses.get(Web3Repository.networkName)?.filter(token => token.address == tokenAddress).map(token => {throw new Error("Already exists")})
        let newList = ContractRepository.tokenAddresses.get(Web3Repository.networkName)

        if(newList === undefined){
            newList = []
        }

        newList.push({
            address:tokenAddress,
            decimal:decimal
        })

        ContractRepository.tokenAddresses.set(Web3Repository.networkName,newList)
    }

    public async getBalanceOfContractsInRepository(){
        this.initializeNetworkContract()
        const {USD} = await this.web3Service.getEthPrice();

        if(Web3Repository.walletAddresses.length == 0 || ContractRepository.tokenAddresses.get(Web3Repository.wethAddress)?.length == 0){
            throw new Error("You need to set token and token contractes")
        }

        const walletAssets = []

        for(const indexWalletAddress in Web3Repository.walletAddresses){
            const walletAddress = Web3Repository.walletAddresses[indexWalletAddress]
            const assets:any = []


            // @ts-ignore
            for(const contractInfo of ContractRepository.tokenAddresses.get(Web3Repository.networkName)){
                const contractToken:ethers.Contract = new ethers.Contract(contractInfo.address,Erc20Abi,Web3Repository.wallet)
                if(contractInfo.address.toLowerCase() == Web3Repository.wethAddress.toLowerCase()){
                    const ethBalance = await this.web3Service.getBalance(walletAddress);

                    assets.push({
                        name:"ETH",
                        balance:ethBalance,
                        decimal:18,
                        valueInUsd: Number(ethers.formatUnits(ethBalance,18)) * USD,
                    })
                    continue;
                }
                const contractName = await this.getContractTransaction("name",3,true,contractToken);
                const walletAssetBalance = await this.getContractTransaction("balanceOf",3,false,contractToken,walletAddress);
                const amountsOutToEth = await this.getContractTransaction("getAmountsOut",3,false,ContractRepository.contractRouter,walletAssetBalance,[contractInfo.address,Web3Repository.wethAddress]);

                if(walletAssetBalance){
                    assets.push({
                        name:contractName,
                        balance:walletAssetBalance,
                        decimal:contractInfo.decimal,
                        valueInUsd: amountsOutToEth[1] ? Number(ethers.formatUnits(amountsOutToEth[1],contractInfo.decimal)) * USD : 0
                    })
                }

            }

            walletAssets.push({
                address:walletAddress,
                assets
            })

        }

        return walletAssets
    }



    private async getTokenBalance(contract:ethers.Contract,walletAddress:string):Promise<{inAddress:bigint,inContract:bigint}>{
        console.log("Getting token balance in address")

        let balanceInAddress:bigint = 0n;
        let balanceInContract:bigint = 0n;

        balanceInAddress = await this.getContractTransaction("balanceOf",3,true,contract,walletAddress)
        balanceInContract = await this.getContractTransaction("balanceOf",3,true,   contract,await contract.getAddress());

        return {
            inAddress:balanceInAddress,
            inContract:balanceInContract
        };
    }

}
