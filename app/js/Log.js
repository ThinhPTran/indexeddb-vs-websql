import ViewModel from './ViewModel';

class Log {

    constructor(prefix) {
        "use strict";
        this.prefix = prefix;
    }

    /*
     This function should be called if the timer is enabled when `busy` is called.
     However, if `amend` is called with a `duration` the timer is also canceled.
     */
    done() {
        "use strict";

        if (this.interId) {
            clearInterval(this.interId);
        }

        this.interId = null;
        this.isBusy = false;
    }

    /*
     Modify the last log message of this instance
     */
    amend(msg, ltype, duration) {
        "use strict";

        if (this.isBusy) {
            if (msg) {
                this.lastMsg.message(msg);
            }

            if (typeof duration === 'number') {
                this.done();
                this.lastMsg.duration(duration);
                this.pending = null;
            }

            if (ltype) {
                this.lastMsg.ltype(ltype);
            }
        }

        return this;
    }

    /*
     This function is different from the other. It doesn't accept a duration, but instead you can activate an timer
     NB: If you enable the time make sure to stop it when done by calling `done` or `amend` with a duration!
     */
    busy(msg, timer) {
        "use strict";
        if (this.interId) {
            throw 'This log instance is still busy!!';
        }

        this.create('busy', msg);
        this.isBusy = true;
        if (timer) {
            this.startTime = new Date();
            this.interId = setInterval(() => {
                let endTime = new Date();
                this.lastMsg.duration(Math.floor((endTime - this.startTime) / 1000) + 's');
            }, 1000);
        }
    }

    getPrefix() {
        "use strict";
        return this.prefix ? `<strong>${this.prefix}</strong>: ` : '';
    }

    create(ltype, msg, duration) {
        "use strict";

        if (this.isBusy) {
            this.amend(this.getPrefix() + msg, ltype, duration).done();
        } else {
            this.lastMsg = Log.create.call(this, ltype, msg, duration);
        }
    }

    debug(msg, duration) {
        this.create('debug', msg, duration);
    }

    warn(msg, duration) {
        "use strict";
        this.create('warn', msg, duration);
    }

    error(msg, duration) {
        this.create('error', msg, duration);
    }

    info(msg, duration) {
        this.create('info', msg, duration);
    }

    static create(ltype, msg, duration) {
        var item = {
            ltype: ko.observable(ltype || 'info'),
            duration: ko.observable(typeof duration === 'number' ? `${duration}s` : (!ltype ? '' : '-')),
            message: ko.observable(this.getPrefix() + msg)
        };
        ViewModel.instance.logHistory.unshift(item);

        return item;
    }

    static clear() {
        "use strict";

        ViewModel.instance.logHistory.removeAll();
    }
}

export default Log
