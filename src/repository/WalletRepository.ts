import { ethers } from "ethers";

export interface WalletRepository {
    getInstance_fromMnemonic(mnemonic:string): any;
}