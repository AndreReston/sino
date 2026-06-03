import { SavedDesign } from '../store/useStore';

const STORAGE_KEY = 'designforge_users';
const SESSION_KEY = 'designforge_current_user';

type StoredUser = {
  password: string;
  designs: SavedDesign[];
};

const safeParse = <T>(value: string | null, fallback: T): T => {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

const loadUsers = (): Record<string, StoredUser> => {
  if (typeof window === 'undefined') return {};
  return safeParse<Record<string, StoredUser>>(window.localStorage.getItem(STORAGE_KEY), {});
};

const saveUsers = (users: Record<string, StoredUser>) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
};

const setCurrentUser = (username: string | null) => {
  if (typeof window === 'undefined') return;
  if (username) {
    window.localStorage.setItem(SESSION_KEY, username);
  } else {
    window.localStorage.removeItem(SESSION_KEY);
  }
};

export const getCurrentUser = (): string | null => {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(SESSION_KEY);
};

export const registerUser = (username: string, password: string) => {
  const users = loadUsers();
  const trimmed = username.trim().toLowerCase();
  if (!trimmed || password.length < 4) {
    return { success: false, message: 'Please enter a valid username and password.' };
  }
  if (users[trimmed]) {
    return { success: false, message: 'A user with that name already exists.' };
  }
  users[trimmed] = { password, designs: [] };
  saveUsers(users);
  setCurrentUser(trimmed);
  return { success: true, message: 'Registration complete.' };
};

export const loginUser = (username: string, password: string) => {
  const users = loadUsers();
  const trimmed = username.trim().toLowerCase();
  const stored = users[trimmed];
  if (!stored || stored.password !== password) {
    return { success: false, message: 'Username or password is incorrect.' };
  }
  setCurrentUser(trimmed);
  return { success: true, message: 'Login successful.' };
};

export const logoutUser = () => {
  setCurrentUser(null);
};

export const getUserDesigns = (username: string): SavedDesign[] => {
  const users = loadUsers();
  return users[username.trim().toLowerCase()]?.designs ?? [];
};

export const saveUserDesign = (username: string, design: SavedDesign) => {
  const users = loadUsers();
  const trimmed = username.trim().toLowerCase();
  const user = users[trimmed] ?? { password: '', designs: [] };

  const existingIndex = user.designs.findIndex((item) => item.id === design.id);
  if (existingIndex >= 0) {
    user.designs[existingIndex] = design;
  } else {
    user.designs.unshift(design);
  }

  users[trimmed] = user;
  saveUsers(users);
};
