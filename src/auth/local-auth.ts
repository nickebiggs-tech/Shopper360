import type { IAuthProvider, AuthUser } from './types'

const USERS: Record<string, { password: string; user: AuthUser }> = {
  Jim: {
    password: '1234',
    user: { username: 'Jim', displayName: 'Jim', role: 'pharmacist' },
  },
  Admin: {
    password: '0000',
    user: { username: 'Admin', displayName: 'Admin User', role: 'admin' },
  },
}

export class LocalAuthProvider implements IAuthProvider {
  async login(username: string, password: string): Promise<AuthUser | null> {
    const entry = USERS[username]
    if (entry && entry.password === password) {
      return entry.user
    }
    return null
  }

  logout(): void {
    // no-op for local auth
  }
}
