"use client";

import { useState, useTransition } from "react";
import Papa from "papaparse";
import { ArrowUpFromLine, CheckCircle2, FileSpreadsheet, Loader2, UploadCloud } from "lucide-react";
import { importTransactions, type ImportTransactionRow } from "../../../../actions/import-transactions";

type PreviewRow = ImportTransactionRow & { id: string };

function parseAmount(value: unknown) {
  const text = String(value ?? "").trim().replace(/R\$\s?/gi, "").replace(/\./g, "").replace(",", ".");
  const amount = Number(text);
  return Number.isFinite(amount) ? amount : 0;
}

function parseOfxDate(value: string) {
  const match = value.match(/^(\d{4})(\d{2})(\d{2})/);
  return match ? `${match[1]}-${match[2]}-${match[3]}` : new Date().toISOString().slice(0, 10);
}

function parseOfx(content: string): ImportTransactionRow[] {
  const rows: ImportTransactionRow[] = [];
  const blocks = content.match(/<STMTTRN>([\s\S]*?)<\/STMTTRN>/gi) ?? [];
  for (const block of blocks) {
    const read = (tag: string) => block.match(new RegExp(`<${tag}>([^<\\r\\n]+)`, "i"))?.[1]?.trim() ?? "";
    const amount = parseAmount(read("TRNAMT"));
    rows.push({
      date: parseOfxDate(read("DTPOSTED")),
      amount,
      type: read("TRNTYPE"),
      payee: read("NAME") || read("PAYEE") || read("MEMO") || "Lançamento OFX",
      category: "Outros",
    });
  }
  return rows;
}

function parseCsv(file: File) {
  return new Promise<ImportTransactionRow[]>((resolve, reject) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const rows = result.data.map((raw) => {
          const normalized = Object.fromEntries(Object.entries(raw).map(([key, value]) => [key.toLocaleLowerCase("pt-BR").trim(), value]));
          return {
            date: normalized.date || normalized.data,
            amount: normalized.amount || normalized.valor,
            type: normalized.type || normalized.tipo,
            payee: normalized.payee || normalized.description || normalized.descricao || normalized.nome,
            category: normalized.category || normalized.categoria || "Outros",
            account: normalized.account || normalized.conta,
          } satisfies ImportTransactionRow;
        });
        resolve(rows);
      },
      error: reject,
    });
  });
}

export function ImportTransactionsPanel() {
  const [rows, setRows] = useState<PreviewRow[]>([]);
  const [fileName, setFileName] = useState("");
  const [account, setAccount] = useState("Conta principal");
  const [busy, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleFile = async (file?: File) => {
    if (!file) return;
    setFeedback(null);
    try {
      const content = await file.text();
      const parsed = file.name.toLowerCase().endsWith(".csv") ? await parseCsv(file) : parseOfx(content);
      setRows(parsed.slice(0, 500).map((row, index) => ({ ...row, account: row.account || account, id: `${file.name}-${index}` })));
      setFileName(file.name);
      if (parsed.length === 0) setFeedback({ type: "error", text: "Não encontrei lançamentos reconhecíveis nesse arquivo." });
    } catch {
      setFeedback({ type: "error", text: "Não foi possível ler o arquivo. Confira se ele é CSV ou OFX válido." });
    }
  };

  const handleImport = () => {
    startTransition(async () => {
      const result = await importTransactions(rows.map(({ id: _id, ...row }) => ({ ...row, account: account || row.account })));
      if (result.imported > 0) {
        setFeedback({ type: "success", text: `${result.imported} lançamento(s) importado(s) com segurança.` });
        setRows([]);
      } else {
        setFeedback({ type: "error", text: result.errors[0] || "Nenhum lançamento foi importado." });
      }
    });
  };

  return (
    <section className="import-panel" aria-labelledby="import-title">
      <div className="import-panel__heading">
        <div className="import-panel__icon"><FileSpreadsheet size={20} /></div>
        <div>
          <p className="eyebrow">IMPORTAÇÃO FINANCEIRA</p>
          <h1 id="import-title">Traga seu histórico para o MuFinance.</h1>
          <p>Envie um CSV ou OFX, confira o preview e confirme o mapeamento antes de gravar seus lançamentos.</p>
        </div>
      </div>

      <div className="import-panel__controls">
        <label className="import-field">
          <span>Conta de destino</span>
          <input value={account} onChange={(event) => setAccount(event.target.value)} placeholder="Ex.: Conta principal" />
        </label>
        <label className="import-upload">
          <input type="file" accept=".csv,.ofx,.qfx,text/csv,application/x-ofx" onChange={(event) => void handleFile(event.target.files?.[0])} />
          <UploadCloud size={18} />
          <span>{fileName || "Selecionar CSV ou OFX"}</span>
          <small>Até 500 lançamentos por importação</small>
        </label>
      </div>

      {feedback && <p className={`import-feedback import-feedback--${feedback.type}`} role="status">{feedback.type === "success" ? <CheckCircle2 size={16} /> : <ArrowUpFromLine size={16} />}{feedback.text}</p>}

      {rows.length > 0 && (
        <>
          <div className="import-preview-heading"><div><strong>Preview dos lançamentos</strong><span>{rows.length} itens reconhecidos</span></div><button className="primary-button" type="button" onClick={handleImport} disabled={busy}>{busy ? <><Loader2 size={15} className="spin" /> Importando…</> : "Confirmar importação"}</button></div>
          <div className="import-table-wrap">
            <table className="import-table">
              <thead><tr><th>Data</th><th>Descrição</th><th>Valor</th><th>Categoria</th></tr></thead>
              <tbody>{rows.slice(0, 30).map((row) => <tr key={row.id}><td>{row.date || "—"}</td><td>{row.payee || row.description || "Lançamento"}</td><td>{String(row.amount ?? "—")}</td><td>{row.category || "Outros"}</td></tr>)}</tbody>
            </table>
            {rows.length > 30 && <p className="import-note">Exibindo os primeiros 30 itens. Todos os {rows.length} itens serão enviados após a confirmação.</p>}
          </div>
        </>
      )}
    </section>
  );
}
