import { Request, Response, NextFunction } from 'express';
import { verify, JsonWebTokenError } from 'jsonwebtoken';
import { config, propertiesToObject } from '../utils/config';

let unsecuredPaths: string[] = [];
const UNAUTHORIZED_STATUS_CODE: number = 401;
const FORBIDDEN_STATUS_CODE: number = 401;

function initUnsecuredPaths() {
    const endpoints = propertiesToObject('management', 'endpoints');
    endpoints['unsecured-default'] = endpoints['unsecured-default'] || [];
    endpoints['unsecured-specific'] = endpoints['unsecured-specific'] || [];
    const unsecuredSet = new Set<string>([
        ...endpoints['unsecured-default'],
        ...endpoints['unsecured-specific']
    ]);
    unsecuredPaths = [...unsecuredSet];
}
/**
 *  i know this looks scary, but it needs to be like this
 */
function getPublicKey() {
    return `-----BEGIN PUBLIC KEY-----\r\n${config().get('auth.jwt.secret')}\r\n-----END PUBLIC KEY-----`;
}

function isPathNotSecured(method: string, path: string): boolean {
    for (let i = 0; i < unsecuredPaths.length; i++) {
        let unsecuredPath = unsecuredPaths[i];
        let parts = unsecuredPath.split(' ');
        let unsecuredMethod = parts.length > 1 ? parts[0] : 'GET';
        let unsecuredPathRegex = parts.length > 1 ? new RegExp(parts[1]) : new RegExp(parts[0]);

        if (unsecuredMethod === method && unsecuredPathRegex.test(path)) {
            return true;
        }
    }
    return false;
}

function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const reqMethod = req.method;
    const reqPath = req.path;

    if (isPathNotSecured(reqMethod, reqPath)) {
        return next();
    }

    let token: string = req.headers.authorization;

    if (!token) {
        return res.status(UNAUTHORIZED_STATUS_CODE).send('Unauthorized');
    }

    if (token.startsWith('JWT')) {
        token = token.slice(4);
    }

    const publicKey = getPublicKey();

    const checkToken = async () => {
        return await verify(
            token,
            publicKey,
            (err: JsonWebTokenError, decoded: Object) => {
                if (err) {
                    console.error(err.message);
                    return false;
                }
                return decoded;
            }
        );
    };

    checkToken().then(response => {
        if (!response) {
            return res.status(FORBIDDEN_STATUS_CODE).send('Forbidden');
        }
        res.locals = {
            token,
            payload: response
        };
        next();
    });
}

function initMiddleware() {
    initUnsecuredPaths();
    return authMiddleware;
}

export default initMiddleware;
