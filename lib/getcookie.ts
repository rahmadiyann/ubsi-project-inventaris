export async function getAuthCookie(str: string): Promise<string | null> {
  const cookies = document.cookie.split(";");
  for (let cookie of cookies) {
    const [name, value] = cookie.trim().split("=");
    if (name === str) {
      return decodeURIComponent(value);
    }
  }
  return null;
}
