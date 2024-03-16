import {ethers} from "ethers";

export const BurnDto = (arg:string) => {
    const args = arg.split(" ")

    if(args.length != 2) throw new Error("invalid or missing arguments")

    const contractAddress = args[0]
    let percentage:number = Number(args[1])

    if(isNaN(percentage as any) || !ethers.isAddress(contractAddress)) throw new Error("invalid value params")
    percentage = Number(percentage)

    return {
        contractAddress,
        percentage
    }

}
