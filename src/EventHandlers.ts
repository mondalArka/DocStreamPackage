import EventEmitter from "node:events";

 class EventHandlers extends EventEmitter {
    constructor() {
        super();
    }

    emitMessage(eventName: string, message: string | object) {
        this.emit(eventName, message);
    }
}

export default new EventHandlers();