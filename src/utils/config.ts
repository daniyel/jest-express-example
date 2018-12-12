/**
 * This is just a mockup of CloudConfig
 */
function Config() {
    this.properties = {
        'management.endpoints.unsecured-default[0]': '/health',
        'management.endpoints.unsecured-default[1]': '/path2',
        'management.endpoints.unsecured-default[2]': '/path3',
        'management.endpoints.unsecured-default[3]': '/path4',
        'auth.jwt.secret': 'foobar'
    } as { [key: string]: string };
    this.get = function(key: string): string {
        return this.properties[key];
    };
    this.toObject = function(): { [key: string]: string } {
        return this.properties;
    };
}

function config() {
    return new Config();
}

function propertiesToObject(...path: string[]): any {

    let obj: { [key: string]: any } = config().toObject();
    for (let part of path) {
        if (obj.hasOwnProperty(part)) {
            obj = obj[part];
        } else {
            return null;
        }
    }
    return obj;
}

export {
    propertiesToObject,
    config
};
