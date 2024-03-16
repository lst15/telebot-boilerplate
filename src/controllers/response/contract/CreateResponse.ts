import {ConfigurationRepository} from "../../../repository/ConfigurationRepository";
import SystemConfigs from "nconf";

export const CreateResponse = (
    contractAddress: string,
    transactionHashTokenTransfer: string | undefined,
    transactionHashETHTransfer: string | undefined,
    blockscan:string,
    linkChannel:string
) => {
    console.log(linkChannel,"cafe")
    let message = "`" + contractAddress + "`\n\n";
    message += `Supply Sent: ${blockscan}tx/${transactionHashTokenTransfer}\n\n`;
    message += `ETH Sent: ${blockscan}tx/${transactionHashETHTransfer}\n\n`;
    message += "Channel: `" + 't.me/'.concat(linkChannel) + "`\n";
    message += "Join: `" + '@'.concat(linkChannel) + "`\n\n";

    return message
}
