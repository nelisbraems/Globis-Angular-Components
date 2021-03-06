import { IConverter, PropertyContext } from '../../sablo/converter.service';
import { WindowRefService } from '../../sablo/util/windowref.service';

export class ClientFunctionConverter implements IConverter {

    constructor( private windowRef: WindowRefService) {
    }
    
    fromClientToServer(): string {
       return null; // client functions can be send back to the server.
    }
    fromServerToClient(serverSentData: string): () => any {
        if (serverSentData) {
            return (...args) => {
                const func = this.windowRef.nativeWindow['svyClientSideFunctions'][serverSentData] as () => any;
                if (func) return func(...args);
            };
        }
        return null;
    }
}
