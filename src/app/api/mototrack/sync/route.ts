import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

function getMuDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL não configurada");
  return neon(url);
}

/**
 * Webhook/API que recebe eventos de abastecimento e manutenção do MotoTrack
 * e reflete em tempo real no MuFinance.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, type, pilotUsername, pilotEmail, data } = body;

    if (!data || !data.id) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
    }

    const sql = getMuDb();

    // Localiza o usuário dono no MuFinance por username 'weverson' ou email
    const profileRows = await sql`
      SELECT uid, email, username
      FROM mufinance.profiles
      WHERE lower(username) = lower(${pilotUsername || "weverson"})
         OR lower(email) = lower(${pilotEmail || "weversonf@gmail.com"})
      LIMIT 1
    `;

    const ownerUid = profileRows[0]?.uid || "rqNvZbOtO4cqE7JPGo16k8lHA2G3";

    // Pega a conta Inter
    const accountRows = await sql`
      SELECT id FROM mufinance.accounts
      WHERE owner_uid = ${ownerUid}
      ORDER BY CASE WHEN lower(name) LIKE '%inter%' THEN 0 ELSE 1 END, created_at ASC
      LIMIT 1
    `;
    const accountId = accountRows[0]?.id;
    if (!accountId) {
      return NextResponse.json({ error: "Nenhuma conta bancária encontrada no MuFinance" }, { status: 400 });
    }

    const externalId = type === "fuel" ? `mototrack-fuel-${data.id}` : `mototrack-maint-${data.id}`;

    if (action === "delete") {
      // Exclui a transação correspondente no MuFinance e estorna o saldo se ela era completed
      const existing = await sql`
        SELECT id, amount, status FROM mufinance.transactions
        WHERE owner_uid = ${ownerUid} AND (source_id = ${externalId} OR notes LIKE ${`%${externalId}%`})
        LIMIT 1
      `;
      if (existing[0]) {
        if (existing[0].status === "completed") {
          await sql`
            UPDATE mufinance.accounts
            SET balance = balance + ${existing[0].amount}, updated_at = now()
            WHERE id = ${accountId} AND owner_uid = ${ownerUid}
          `;
        }
        await sql`
          DELETE FROM mufinance.transactions
          WHERE id = ${existing[0].id} AND owner_uid = ${ownerUid}
        `;
      }
      return NextResponse.json({ ok: true, deleted: true });
    }

    // Ação 'upsert' (criar ou atualizar)
    let amount = 0;
    let payee = "";
    let notes = "";
    let dateStr = new Date().toISOString().split("T")[0];

    if (type === "fuel") {
      amount = Number((Number(data.totalCents ?? 0) / 100).toFixed(2));
      payee = data.station ? String(data.station).trim() : "Abastecimento MotoTrack";
      if (data.date) dateStr = String(data.date).split("T")[0];
      notes = `Abastecimento MotoTrack: ${data.liters ? `${data.liters}L` : ""} ${data.odometerKm ? `(${data.odometerKm} km)` : ""}`.trim();
    } else {
      if (data.costCents) amount = Number((Number(data.costCents) / 100).toFixed(2));
      else if (data.cost) amount = Number(Number(data.cost).toFixed(2));
      payee = data.title ? String(data.title).trim() : "Manutenção MotoTrack";
      dateStr = data.doneAt || data.date || dateStr;
      notes = `Manutenção MotoTrack: ${data.description || data.notes || ""} ${data.odometerKm ? `(${data.odometerKm} km)` : ""}`.trim();
    }

    if (amount <= 0) {
      return NextResponse.json({ ok: true, skipped: "Valor zerado" });
    }

    const existing = await sql`
      SELECT id, amount, status FROM mufinance.transactions
      WHERE owner_uid = ${ownerUid} AND (source_id = ${externalId} OR notes LIKE ${`%${externalId}%`})
      LIMIT 1
    `;

    if (existing[0]) {
      // Atualiza
      const oldAmount = Number(existing[0].amount);
      const diff = amount - oldAmount;
      await sql`
        UPDATE mufinance.transactions
        SET amount = ${amount}, payee = ${payee}, notes = ${notes}, date = ${dateStr}, updated_at = now()
        WHERE id = ${existing[0].id} AND owner_uid = ${ownerUid}
      `;
      if (existing[0].status === "completed" && diff !== 0) {
        await sql`
          UPDATE mufinance.accounts
          SET balance = balance - ${diff}, updated_at = now()
          WHERE id = ${accountId} AND owner_uid = ${ownerUid}
        `;
      }
      return NextResponse.json({ ok: true, action: "updated" });
    } else {
      // Insere nova
      const newId = crypto.randomUUID();
      await sql`
        INSERT INTO mufinance.transactions
          (id, owner_uid, account_id, date, payee, category, amount, type, status, source_type, source_id, notes)
        VALUES
          (${newId}, ${ownerUid}, ${accountId}, ${dateStr}, ${payee}, 'Transporte', ${amount}, 'expense', 'completed', 'account', ${externalId}, ${notes})
      `;
      await sql`
        UPDATE mufinance.accounts
        SET balance = balance - ${amount}, updated_at = now()
        WHERE id = ${accountId} AND owner_uid = ${ownerUid}
      `;
      return NextResponse.json({ ok: true, action: "created", id: newId });
    }
  } catch (error: any) {
    console.error("[api/mototrack/sync]", error);
    return NextResponse.json({ error: error?.message || "Erro interno" }, { status: 500 });
  }
}
