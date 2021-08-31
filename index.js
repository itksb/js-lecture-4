/**
 * Модуль "Практическая работа с использованием JS №2"
 *
 * Т.З.:
 * Сделать приложение на js, можно браузерное можно консольное (запуск через nodejs), которое при запуске
 * запрашивает ваше имя и выводит его в обратном порядке. к примеру вход: имя, выход: ямИ
 */

(function () {

    class NotImplementedError extends Error {
        constructor(message = "This feature is not implemented. Override it!") {
            super(message);
        }
    }

    class InstanceOfAbstractError extends TypeError {
        constructor(message = "Cannot construct instances of abstract classes. Also do not call super on such methods..") {
            super(message);
        }
    }

// источник данных
    class AbstractDataProvider {
        #configuration = {};

        constructor(configuration) {
            if (new.target === AbstractDataProvider) {
                throw new TypeError();
            }
            this.#configuration = configuration;
        }

        /**
         * Reads data from the datasource
         * @param param
         * @return {Promise<string>}
         */
        async readAsync(param) {
            throw new InstanceOfAbstractError();
            return new Promise(
                () => {
                    console?.log("Just a dummy for explicit contract. Never should be called");
                });
        }

        /**
         * destructor
         */
        destroy() {
            throw new InstanceOfAbstractError();
            return new Promise(
                () => {
                    console?.log("Just a dummy for explicit contract. Never should be called");
                });
        }
    }

    class OSConsoleDataProvider extends AbstractDataProvider {
        #readline = {};
        #console  = {};

        constructor(configuration = {}) {
            super(configuration);
            this.#readline = require('readline');
        }

        async readAsync(param) {
            this.#console = this.#readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });

            return new Promise((resolve, reject) => {
                try {
                    this.#console.question(param, answer => {
                        resolve(answer);
                        this.#destroy();
                    });
                } catch (e) {
                    reject('Error reading console');
                    this.#destroy();
                }

            });
        }

        #destroy() {
            this.#readline = null;
            this.#console.close();
            this.#console = null;  // Garbage Collector will weep the memory
        }
    }

    class BrowserPromptDataProvider extends AbstractDataProvider {
        async readAsync(param) {
            return new Promise((resolve, reject) => {
                resolve(prompt(param));
            });
        }
    }

    // Presentation layer
    class AbstractView {
        render() {
            throw new InstanceOfAbstractError();
        }
    }

    class ConsoleView extends AbstractView {
        render() {
            console.log([...arguments]);
        }
    }

    class JsonView extends AbstractView {
        render() {
            console.log(JSON.stringify([...arguments][0]));
        }
    }

    class StringHelper {
        static reverse(str) {
            if (typeof str === "undefined") {
                throw new TypeError('Empty argument!');
            }
            if (Object.prototype.toString.call(str) !== "[object String]") {
                throw new TypeError('Str argument is not a string!');
            }
            return str.split("").reverse().join("");
        }

        static makeLastCharInUpperCase(str) {
            if (typeof str === "undefined") {
                throw new TypeError('Empty argument!');
            }
            if (Object.prototype.toString.call(str) !== "[object String]") {
                throw new TypeError('Str argument is not a string!');
            }
            if (!str.length) {
                throw new TypeError('Str argument is empty!');
            }

            return str.substr(0, str.length - 1) + (str.charAt(str.length - 1)).toUpperCase();
        }


    }

    // логика
    class LogicService {
        doSomeProcess(str) {
            return StringHelper.makeLastCharInUpperCase(StringHelper.reverse(str));
        }
    }

    // Application layer
    class Application {
        #view;
        #dataProvider;

        init({view, dataProvider}) {
            if (!view instanceof AbstractView) {
                throw new TypeError('view - wrong type.');
            }
            if (!dataProvider instanceof AbstractDataProvider) {
                throw new TypeError('dataProvider - wrong type.');
            }
            this.#view         = view;
            this.#dataProvider = dataProvider;

            return this;
        }

        run() {
            this.#dataProvider.readAsync('Введите ваше имя: ').then((answer) => {
                setTimeout(() => {
                    const service = new LogicService();
                    this.#view.render(service.doSomeProcess(answer));
                }, 3000);

                return this;
            });
        }
    }


    // клиентский код
    // реализация dataProvider может задаваться например, конфигурацией
    let dataProvider;

    function isNodeJsEnvironment() {
        return typeof module !== 'undefined' && module.exports;
    }

    if (isNodeJsEnvironment()) {
        dataProvider = new OSConsoleDataProvider();
    } else {
        dataProvider = new BrowserPromptDataProvider();
    }
    const view = new ConsoleView();
    const app  = new Application();
    app
        .init({view, dataProvider})
        .run();

})();
