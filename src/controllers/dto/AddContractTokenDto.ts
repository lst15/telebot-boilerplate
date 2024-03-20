import {ethers} from "ethers";

export const AddContractTokenDto = (arg:string) => {
    const args:string[] = arg.split(" ")

    if(args.length == 0 || args.length < 2) throw new Error("missing arguments");
    if(!ethers.isAddress(args[0])) throw new Error("invalid address")

    return {
        address:args[0],
        decimal:Number(args[1])
    }
}
