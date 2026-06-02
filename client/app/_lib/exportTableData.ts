/* eslint-disable @typescript-eslint/no-explicit-any */
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { HeaderType } from "./CommonTypes";
import { formatDate } from "./utils";

type ExportType = "csv" | "pdf" | "excel";

type ExportTableDataProps<T> = {
  headers: HeaderType[];
  data: T[];
  excludeKeys?: string[];
  type?: ExportType;
  filename?: string;
};

export function exportTableData<T extends Record<string, any>>({
  headers,
  data,
  excludeKeys = [],
  type = "csv",
  filename = "table_export",
}: ExportTableDataProps<T>) {
  try {
    // filter valid headers
    const filteredHeaders = headers.filter(
      (header) => header.key && !excludeKeys.includes(header.key),
    );

    // header labels
    const exportHeaders = filteredHeaders.map((header) => header.label);

    // row data
    const exportRows = data.map((row) =>
      filteredHeaders.map((header) => {
        const value = row[header.key!];

        // handle null/undefined/object
        if (value === null || value === undefined) return "";

        if (typeof value === "object") {
          return JSON.stringify(value);
        }

        return value;
      }),
    );

    switch (type) {
      case "csv":
      case "excel": {
        const worksheet = XLSX.utils.aoa_to_sheet([
          exportHeaders,
          ...exportRows,
        ]);

        const workbook = XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

        XLSX.writeFile(
          workbook,
          `${filename}_${formatDate(new Date())}.${type === "csv" ? "csv" : "xlsx"}`,
        );

        break;
      }

      case "pdf": {
        const doc = new jsPDF({
          orientation: "landscape",
        });

        autoTable(doc, {
          head: [exportHeaders],
          body: exportRows,
          styles: {
            fontSize: 8,
            cellPadding: 2,
          },
          headStyles: {
            fontStyle: "bold",
          },
        });

        doc.save(`${filename}_${formatDate(new Date())}.pdf`);

        break;
      }

      default:
        throw new Error(`Unsupported export type: ${type}`);
    }
  } catch (error) {
    console.error("Export failed:", error);
  }
}
