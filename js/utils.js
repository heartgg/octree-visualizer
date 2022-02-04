// helper functions

export const sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}

export const csvToArray = (str, delimiter = ",") => {
    // slice from start of text to the first \n index
    // use split to create an array from string by delimiter
    const headers = str.slice(0, str.indexOf("\r")).split(delimiter);

    // slice from \n index + 1 to the end of the text
    // use split to create an array of each csv value row
    const rows = str.slice(str.indexOf("\r") + 1).split("\r");

    // Map the rows
    // split values from each row into an array
    // use headers.reduce to create an object
    // object properties derived from headers:values
    // the object passed as an element of the array
    const arr = rows.map(function (row) {
        const values = row.split(delimiter);
        const el = headers.reduce(function (object, header, index) {
            object[header] = parseFloat(values[index]);
            return object;
        }, {});
        return el;
    });

    // return the array
    return arr;
}

export const max = (data) => {
    var max = Number.MIN_VALUE;
    data.forEach(coord => {
        for (const key in coord) {
            if (coord[key] > max) {
                max = coord[key];
            }
        }
    });
    return max;
}