import { NextRequest, NextResponse } from "next/server";
import { validateCredentials } from "@/lib/auth";
import { createSession, deleteSession } from "@/lib/session";

// POST /api/auth - Login
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, password } = body;

    if (!id || !password) {
      return NextResponse.json(
        { error: "请输入ID和密码" },
        { status: 400 }
      );
    }

    if (!validateCredentials(id, password)) {
      return NextResponse.json(
        { error: "ID或密码不正确" },
        { status: 401 }
      );
    }

    await createSession(id);

    return NextResponse.json({ success: true, userId: id });
  } catch {
    return NextResponse.json(
      { error: "登录失败" },
      { status: 500 }
    );
  }
}

// DELETE /api/auth - Logout
export async function DELETE() {
  try {
    await deleteSession();
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "退出登录失败" },
      { status: 500 }
    );
  }
}
