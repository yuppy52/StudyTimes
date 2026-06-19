import { useState } from "react";
import { supabase } from "./supabase";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const App = () => {
  // UseQueryClientの呼び出し
  const queryClient = useQueryClient();

  // supabaseからデータを取得するためのクエリ
  const {
    data: records,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["study-record"],
    queryFn: async () => {
      const { data, error } = await supabase.from("study-record").select("*");
      if (error) throw error;
      return data || [];
    },
  });

  const [inputText, setInputText] = useState("");
  const [inputTime, setInputTime] = useState(0);
  const [haveError, sethaveError] = useState(false);
  const totalTime =
    records?.reduce((sum, record) => sum + Number(record.time), 0) ?? 0;

  const onClickRegisterButton = async () => {
    if (inputText === "" || inputTime <= 0) {
      sethaveError(true);
      return;
    }
    const newRecord = { title: inputText, time: inputTime };
    try {
      const { error } = await supabase.from("study-record").insert(newRecord);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["study-record"] });

      setInputText("");
      setInputTime(0);
      sethaveError(false);
    } catch (error) {
      console.error("エラーが発生しました:", error);
    }
  };

  const onClickDeleteButton = async (recordId) => {
    try {
      const { error } = await supabase
        .from("study-record")
        .delete()
        .eq("id", recordId);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["study-record"] });
    } catch (error) {
      console.error("エラーが発生しました:", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-2xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-700 mb-2">学習記録</h1>
          <p className="text-gray-600">毎日の学習をトラッキングしましょう</p>
        </div>

        {/* Status Messages */}
        {isLoading && (
          <div className="bg-slate-100 border border-slate-300 rounded-lg p-4 mb-6 text-slate-700">
            読み込み中...
          </div>
        )}
        {isError && (
          <div className="bg-red-50 border border-red-300 rounded-lg p-4 mb-6 text-red-700">
            エラー: {error.message}
          </div>
        )}

        {/* Input Card */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            新規学習記録
          </h2>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              学習内容
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition"
              placeholder="例：数学の勉強、英語のリーディング"
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
              }}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              学習時間（時間）
            </label>
            <input
              type="number"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition"
              placeholder="0"
              value={inputTime}
              onChange={(e) => {
                setInputTime(e.target.value);
              }}
            />
          </div>

          {haveError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-red-700 text-sm">
              登録されていない項目があります
            </div>
          )}

          <button
            className="w-full bg-slate-700 hover:bg-slate-800 text-white font-semibold py-2 px-4 rounded-lg transition shadow-md hover:shadow-lg"
            onClick={onClickRegisterButton}
          >
            登録
          </button>
        </div>

        {/* Records List */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">学習履歴</h2>
          {records && records.length > 0 ? (
            <div className="space-y-3">
              {records.map((record, index) => {
                return (
                  <div
                    key={index}
                    className="bg-white rounded-lg shadow-md border border-gray-200 p-4 flex items-center justify-between hover:shadow-lg transition"
                  >
                    <div className="flex-1">
                      <p className="text-gray-800 font-medium">
                        {record.title}
                      </p>
                      <p className="text-sm text-slate-600">
                        学習時間:{" "}
                        <span className="text-slate-700 font-semibold">
                          {record.time}時間
                        </span>
                      </p>
                    </div>
                    <button
                      className="bg-red-500 hover:bg-red-600 text-white font-medium py-1 px-3 rounded-lg transition text-sm"
                      onClick={() => {
                        onClickDeleteButton(record.id);
                      }}
                    >
                      削除
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-6 text-center text-gray-500">
              まだ学習記録がありません
            </div>
          )}
        </div>

        {/* Summary Card */}
        {records && records.length > 0 && (
          <div className="bg-slate-700 rounded-lg shadow-lg p-6 text-white">
            <p className="text-sm opacity-90 mb-1">合計学習時間</p>
            <p className="text-3xl font-bold">{totalTime}時間</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
