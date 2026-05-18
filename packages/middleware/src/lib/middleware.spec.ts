
import { isAuthenticated } from './middleware';

describe('isAuthenticated', () => {
  it('should work', () => {
    expect(typeof isAuthenticated).toEqual('function');
  });
});
