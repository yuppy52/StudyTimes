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
    <div>
      <div>
        {isLoading && <p>読み込み中...</p>}
        {isError && <p>エラー: {error.message}</p>}
        <div className="flex m-2">
          <p>学習内容：</p>
          <input
            type="text"
            className="border"
            value={inputText}
            onChange={(e) => {
              setInputText(e.target.value);
            }}
          />
        </div>
        <div className="flex m-2">
          <p>学習時間：</p>
          <input
            type="number"
            className="border"
            value={inputTime}
            onChange={(e) => {
              setInputTime(e.target.value);
            }}
          />
        </div>
        <div className="mx-2">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={onClickRegisterButton}
          >
            登録
          </button>
        </div>
        <div className="m-2">
          {haveError && (
            <p className="text-red-500">登録されていない項目があります</p>
          )}
        </div>
      </div>
      <div>
        {records?.map((record, index) => {
          return (
            <div key={index} className="m-2 flex gap-4">
              <div>
                <p>学習内容：{record.title}</p>
                <p className="text-gray-500">学習時間：{record.time}(h)</p>
              </div>
              <div>
                <button
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
                  onClick={() => {
                    onClickDeleteButton(record.id);
                  }}
                >
                  削除
                </button>
              </div>
            </div>
          );
        })}
        <div className="m-2">
          <p>合計学習時間：{totalTime}</p>
        </div>
      </div>
    </div>
  );
};

export default App;
