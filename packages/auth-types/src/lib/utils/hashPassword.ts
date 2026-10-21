import { hash, verify, type HashOptions as Options } from 'argon2';

const opts: Options = {
  memoryCost: 19456,
  timeCost: 2,
  hashLength: 32,
  parallelism: 1,
};

export async function hashPassword(password: string): Promise<string> {
  const result = await hash(password, opts);
  return result;
}

export async function verifyPassword(data: { password: string; hash: string }) {
  const { password, hash } = data;

  const result = await verify(hash, password, opts);
  return result;
}
