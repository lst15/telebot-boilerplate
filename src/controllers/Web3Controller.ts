import {Web3Service} from "../services/Web3Service";
import {TelebotRouterDeco} from "../deco/TelebotRouterDeco";

const service = new Web3Service();

export class Web3Controller {

    @TelebotRouterDeco("runNodeCrawler")
    async runNodeCrawler(arg:string) {
        service.startNodeCrawler()

        return {
            message:"Running"
        }
    }

    @TelebotRouterDeco("stopNodeCrawler")
    async stopNodeCrawler(arg:string) {
        service.stopNodeCrawler()

        return {
            message:"Running"
        }
    }

}
