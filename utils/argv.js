function parseParameters(argv) {
    const myArgs = process.argv.slice(2);
    let address = undefined;

    let i = 0;
    while (i < myArgs.length) {

        switch (myArgs[i]) {
            case '--address':
            case '--A':
                // Get index of key in keyMap
                address = myArgs[i + 1];
                break;
        }
        i += 2;
    }

    return [address];
}

module.exports = { parseParameters };