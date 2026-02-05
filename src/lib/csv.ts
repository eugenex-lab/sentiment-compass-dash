import { FearGreedDataPoint } from "@/hooks/useFearGreedIndex";
import { format } from "date-fns";

export const downloadCSV = (data: FearGreedDataPoint[], filename: string) => {
  const headers = ["Date", "Value", "Classification"];
  const rows = data.map((point) => [
    format(point.date, "yyyy-MM-dd"),
    point.value.toString(),
    point.value_classification,
  ]);

  const csvContent =
    "data:text/csv;charset=utf-8," +
    [headers, ...rows].map((e) => e.join(",")).join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
