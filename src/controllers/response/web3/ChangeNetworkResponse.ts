import {Web3Repository} from "../../../repository/Web3Repository";

export const ChangeNetworkResponse = () => {
    return `${Web3Repository.networkName} was selected`;
}
