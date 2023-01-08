const fs = require('fs');

export const remove = async (path: string) => {
    console.log("path: ", path);

    return new Promise((resolve, reject) => {
        fs.rm(path, { recursive: true }, (error) => {
            if (error) {
                console.log("remove error: ", error);
                reject(false);
            }

            resolve(true);
        });
    });
}