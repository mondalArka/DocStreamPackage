import EventEmitter from "node:events";

export class EventHandlers extends EventEmitter {
    constructor() {
        super();
    }

    emitMessage(eventName: string, message: string | object) {
        this.emit(eventName, message);
    }


}