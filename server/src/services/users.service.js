import { findUserByUid, findUserByEmail, createUser } from '../data/users.repo.js';

export async function getOrCreateUserByToken(decoded) {
  const { uid, email, name } = {
    uid: decoded.uid,
    email: decoded.email,
    name: decoded.name || decoded.email?.split('@')[0]
  };
  let user = uid ? await findUserByUid(uid) : await findUserByEmail(email);
  if (!user) user = await createUser({ uid, email, name, role: 'student' });
  return user;
}