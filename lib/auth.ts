const VALID_USER = {
  id: "Hongbin",
  password: "HongbinBro123!",
};

export function validateCredentials(id: string, password: string): boolean {
  return id === VALID_USER.id && password === VALID_USER.password;
}
