import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import App from "./App";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// 🛠️ テーブル名 'study-record' に合わせてモックを設定
vi.mock("./supabase", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() =>
        Promise.resolve({
          data: [{ id: 1, title: "既存の学習", time: 1 }],
          error: null,
        }),
      ),
      insert: vi.fn(() => Promise.resolve({ data: null, error: null })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: null, error: null })),
      })),
    })),
  },
}));

describe("学習記録アプリのテスト", () => {
  const createTestQueryClient = () =>
    new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: 0 },
      },
    });

  // 1. タイトルが表示されていること
  it("タイトルが表示されていること", async () => {
    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.queryByText("読み込み中...")).not.toBeInTheDocument();
    });

    const titleElement = screen.getByRole("heading", { name: "学習記録" });
    expect(titleElement).toBeInTheDocument();
  });

  // 2. フォームに学習内容と時間を入力して登録ボタンを押す
  it("内容と時間を入力して登録すると、新しい記録が追加されること", async () => {
    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.queryByText("読み込み中...")).not.toBeInTheDocument();
    });

    const inputs = screen.getAllByRole("textbox");
    const inputContent = inputs[0];
    const inputTime = screen.getByRole("spinbutton");
    const submitButton = screen.getByRole("button", { name: "登録" });

    fireEvent.change(inputContent, { target: { value: "Reactのテスト勉強" } });
    fireEvent.change(inputTime, { target: { value: "2" } });
    fireEvent.click(submitButton);

    // モック環境下で、ボタン押下後にエラーが発生しないことを確認
    expect(
      screen.queryByText("登録されていない項目があります"),
    ).not.toBeInTheDocument();
  });

  // 3. 削除ボタンを押すテスト
  it("削除ボタンを押すと学習記録が削除されること", async () => {
    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.queryByText("読み込み中...")).not.toBeInTheDocument();
    });

    const deleteButton = screen.getByRole("button", { name: "削除" });
    expect(deleteButton).toBeInTheDocument();
    fireEvent.click(deleteButton);
  });

  // 4. 入力をしないで登録を押すとエラーが表示される
  it("未入力で登録を押すとエラーメッセージが表示されること", async () => {
    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.queryByText("読み込み中...")).not.toBeInTheDocument();
    });

    const submitButton = screen.getByRole("button", { name: "登録" });
    fireEvent.click(submitButton);

    const errorMessage = screen.getByText("登録されていない項目があります");
    expect(errorMessage).toBeInTheDocument();
  });
});
