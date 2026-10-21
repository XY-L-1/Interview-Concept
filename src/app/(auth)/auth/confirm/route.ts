import { completeLogin } from "@/modules/identity/callback";

export async function GET(request: Request) {
  return completeLogin(request, "token");
}
