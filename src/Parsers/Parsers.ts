import * as constants from "../constants";

export class Parser {
    public static Parse<T>(inputString: string): T {
        constants.logger.debug("Parser input: " + inputString);
        let object: T = JSON.parse(inputString);
        return object;
    }
}