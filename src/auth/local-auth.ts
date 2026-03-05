import type { IAuthProvider, AuthUser } from './types'

const USERS: Record<string, { password: string; user: AuthUser }> = {
  George: {
    password: '1234',
    user: { username: 'George', displayName: 'Pharmacist George', role: 'pharmacist' },
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
