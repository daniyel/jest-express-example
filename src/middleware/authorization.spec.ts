import auth from './authorization';
import { Request } from 'jest-express/lib/request';
import { Response } from 'jest-express/lib/response';
import { propertiesToObject } from '../utils/config';
import 'jest';

jest.mock('../utils/config');

test('should let me pass', (done) => {
    propertiesToObject.mockReturnValue({
        'unsecured-default': ['/health'],
        'unsecured-specific': []
    });
    const middleware = auth();
    const next = jest.fn(() => done());
    const req = new Request('/health', {
        headers: {
            'Content-Type': 'application/json'
        }
    });
    const res = new Response();
    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
});
