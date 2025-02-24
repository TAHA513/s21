import NodeCache from "node-cache";

// Cache for storing user data
const userCache = new NodeCache();

// Simple types for our in-memory storage
type User = {
  id: number;
  username: string;
  password: string;
  name: string;
  role: string;
};

export class MemStorage {
  private getNextId(): number {
    const users = this.getUsers();
    return users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
  }

  private getUsers(): User[] {
    return userCache.get('users') || [];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const users = this.getUsers();
    return users.find(u => u.username === username);
  }

  async getUser(id: number): Promise<User | undefined> {
    const users = this.getUsers();
    return users.find(u => u.id === id);
  }

  async createUser(data: Omit<User, 'id' | 'role'>): Promise<User> {
    const users = this.getUsers();

    // Check if username exists
    if (users.some(u => u.username === data.username)) {
      throw new Error('اسم المستخدم موجود بالفعل');
    }

    const newUser: User = {
      ...data,
      id: this.getNextId(),
      role: 'staff'
    };

    users.push(newUser);
    userCache.set('users', users);
    return newUser;
  }

  async clearAllData(): Promise<void> {
    userCache.flushAll();
  }
}

// Export a single instance
export const storage = new MemStorage();