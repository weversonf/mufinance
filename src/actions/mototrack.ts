"use server";

import { neon } from "@neondatabase/serverless";
import { revalidatePath } from "next/cache";
import { requireSessionUser } from "@/lib/auth/session";
import { sql as sqlMu } from "@/lib/neon/db";

// Neon do MotoTrack
function getMotoTrackDb() {
  const url = process.env.MOTOTRACK_DATABASE_URL || "postgresql://bd_motogarage_owner:npg_aTMvPiefr71c@ep-wandering-feather-b6du83dr-pooler.c-2.sa-east-1.aws.neon.tech/bd_motogarage?channel_binding=require&sslmode=require";
  return neon(url);
}

export type MotoTrackStatus = {
  connected: boolean;
  motoUserId: string | null;
  username: string | null;
  displayName: string | null;
  email: string | null;
  motosCount: number;
  fuelEntriesCount: number;
  maintenanceCount: number;
  lastSyncedAt: string | null;
  transportCategoryCount: number;
};

/**
 * Obtém o status da conexão do MuFinance com o MotoTrack para o usuário logado
 */
export async function getMotoTrackStatus(): Promise<MotoTrackStatus> {
  const user = await requireSessionUser();
  const sqlMoto = getMotoTrackDb();

  // Conta quantas transações de transporte existem no MuFinance
  const transportRows = await sqlMu`
    SELECT count(*)::int as total
    FROM mufinance.transactions
    WHERE owner_uid = ${user.uid}
      AND (lower(category) = 'transporte' OR lower(category) = 'combustível' OR lower(category) = 'veículo')
  `;
  const transportCount = Number(transportRows[0]?.total ?? 0);

  // Busca o piloto no MotoTrack por email ou username 'weverson'
  const userEmail = user.email?.toLowerCase().trim() ?? "";
  const pilotRows = await sqlMoto`
    SELECT user_id, email, display_name, username
    FROM motogarage.pilots
    WHERE lower(email) = ${userEmail}
       OR lower(username) = 'weverson'
    LIMIT 1
  `;

  if (!pilotRows[0]) {
    return {
      connected: false,
      motoUserId: null,
      username: null,
      displayName: null,
      email: null,
      motosCount: 0,
      fuelEntriesCount: 0,
      maintenanceCount: 0,
      lastSyncedAt: null,
      transportCategoryCount: transportCount,
    };
  }

  const pilot = pilotRows[0];
  const motoUserId = String(pilot.user_id);

  // Lê o snapshot do piloto
  const snapRows = await sqlMoto`
    SELECT payload, updated_at
    FROM motogarage.garage_snapshots
    WHERE user_id = ${motoUserId}
    LIMIT 1
  `;

  const payload = (snapRows[0]?.payload as any) ?? {};
  const motorcycles = Array.isArray(payload.motorcycles) ? payload.motorcycles : [];
  const fuelEntries = Array.isArray(payload.fuelEntries) ? payload.fuelEntries : [];
  const maintenance = Array.isArray(payload.maintenance) ? payload.maintenance : [];

  return {
    connected: true,
    motoUserId,
    username: pilot.username ? String(pilot.username) : "weverson",
    displayName: pilot.display_name ? String(pilot.display_name) : (user.name ?? null),
    email: pilot.email ? String(pilot.email) : (user.email ?? null),
    motosCount: motorcycles.length,
    fuelEntriesCount: fuelEntries.length,
    maintenanceCount: maintenance.length,
    lastSyncedAt: snapRows[0]?.updated_at ? new Date(snapRows[0].updated_at).toLocaleString("pt-BR") : null,
    transportCategoryCount: transportCount,
  };
}

/**
 * Cria/Associa o piloto no MotoTrack caso ainda não exista
 */
export async function createMotoTrackAccount() {
  const user = await requireSessionUser();
  const sqlMoto = getMotoTrackDb();

  const userEmail = user.email?.toLowerCase().trim() ?? "weversonf@gmail.com";
  const displayName = user.name || "Weverson Feitosa";

  // Cria ou atualiza o piloto
  await sqlMoto`
    INSERT INTO motogarage.pilots (user_id, email, display_name, username, provider, first_seen_at, last_seen_at)
    VALUES (${user.uid}, ${userEmail}, ${displayName}, 'weverson', 'google.com', now(), now())
    ON CONFLICT (user_id) DO UPDATE
      SET email = ${userEmail},
          display_name = ${displayName},
          username = 'weverson',
          last_seen_at = now();
  `;

  // Garante que o snapshot exista
  await sqlMoto`
    INSERT INTO motogarage.garage_snapshots (user_id, payload)
    VALUES (${user.uid}, '{"motorcycles":[],"maintenance":[],"fuelEntries":[],"rides":[],"invites":[],"activeMotorcycleId":""}'::jsonb)
    ON CONFLICT (user_id) DO NOTHING;
  `;

  revalidatePath("/mototrack");
  return { ok: true, message: "Conta e Garagem no MotoTrack vinculadas com sucesso!" };
}

/**
 * Sincroniza lançamentos bidirecionalmente entre MuFinance e MotoTrack
 */
export async function syncMotoTrack() {
  const user = await requireSessionUser();
  const sqlMoto = getMotoTrackDb();

  const userEmail = user.email?.toLowerCase().trim() ?? "";
  const pilotRows = await sqlMoto`
    SELECT user_id, email, display_name, username
    FROM motogarage.pilots
    WHERE lower(email) = ${userEmail}
       OR lower(username) = 'weverson'
    LIMIT 1
  `;

  if (!pilotRows[0]) {
    throw new Error("Conta MotoTrack não encontrada. Crie ou vincule primeiro.");
  }

  const motoUserId = String(pilotRows[0].user_id);

  // 1. Lê os dados atuais do MotoTrack
  const snapRows = await sqlMoto`
    SELECT payload, updated_at
    FROM motogarage.garage_snapshots
    WHERE user_id = ${motoUserId}
    LIMIT 1
  `;

  const payload = (snapRows[0]?.payload as any) || {
    motorcycles: [],
    maintenance: [],
    fuelEntries: [],
    rides: [],
    invites: [],
    activeMotorcycleId: "",
  };

  const fuelEntries = Array.isArray(payload.fuelEntries) ? [...payload.fuelEntries] : [];
  const maintenance = Array.isArray(payload.maintenance) ? [...payload.maintenance] : [];

  // Pega a conta Inter do usuário no MuFinance (ou a primeira conta existente)
  const accounts = await sqlMu`
    SELECT id, name FROM mufinance.accounts
    WHERE owner_uid = ${user.uid}
    ORDER BY CASE WHEN lower(name) LIKE '%inter%' THEN 0 ELSE 1 END, created_at ASC
    LIMIT 1
  `;
  const defaultAccountId = accounts[0]?.id ? String(accounts[0].id) : null;

  if (!defaultAccountId) {
    throw new Error("Nenhuma conta encontrada no MuFinance para debitar os lançamentos.");
  }

  let importedToMuCount = 0;

  // 2. Importa / Sincroniza Abastecimentos do MotoTrack para o MuFinance
  for (const fuel of fuelEntries) {
    if (!fuel || !fuel.id) continue;
    const externalId = `mototrack-fuel-${fuel.id}`;
    const amount = Number((Number(fuel.totalCents ?? 0) / 100).toFixed(2));
    if (amount <= 0) continue;

    const payee = fuel.station ? String(fuel.station).trim() : "Abastecimento MotoTrack";
    
    // Converte a data
    let dateStr = new Date().toISOString().split("T")[0];
    if (fuel.date) {
      dateStr = String(fuel.date).split("T")[0];
    } else if (fuel.dateLabel && fuel.dateLabel.includes("out")) {
      dateStr = "2026-10-27";
    }

    const notes = `Abastecimento MotoTrack: ${fuel.liters ? `${fuel.liters}L` : ""} ${fuel.odometerKm ? `(${fuel.odometerKm} km)` : ""}`.trim();

    // Verifica se já existe no MuFinance
    const existing = await sqlMu`
      SELECT id, amount, date FROM mufinance.transactions
      WHERE owner_uid = ${user.uid} AND (source_id = ${externalId} OR (notes LIKE ${`%${externalId}%`}))
      LIMIT 1
    `;

    if (!existing[0]) {
      // Cria a transação realizada
      const newId = crypto.randomUUID();
      await sqlMu`
        INSERT INTO mufinance.transactions
          (id, owner_uid, account_id, date, payee, category, amount, type, status, source_type, source_id, notes)
        VALUES
          (${newId}, ${user.uid}, ${defaultAccountId}, ${dateStr}, ${payee}, 'Transporte', ${amount}, 'expense', 'completed', 'account', ${externalId}, ${notes})
      `;
      // Debita o saldo da conta
      await sqlMu`
        UPDATE mufinance.accounts
        SET balance = balance - ${amount}, updated_at = now()
        WHERE id = ${defaultAccountId} AND owner_uid = ${user.uid}
      `;
      importedToMuCount++;
    }
  }

  // 3. Importa / Sincroniza Manutenções do MotoTrack para o MuFinance
  for (const maint of maintenance) {
    if (!maint || !maint.id) continue;
    if (maint.status !== "completed" && !maint.cost && !maint.costCents) continue;
    const externalId = `mototrack-maint-${maint.id}`;
    let amount = 0;
    if (maint.costCents) amount = Number((Number(maint.costCents) / 100).toFixed(2));
    else if (maint.cost) amount = Number(Number(maint.cost).toFixed(2));
    if (amount <= 0) continue;

    const payee = maint.title ? String(maint.title).trim() : "Manutenção MotoTrack";
    const dateStr = maint.doneAt || maint.date || new Date().toISOString().split("T")[0];
    const notes = `Manutenção MotoTrack: ${maint.description || maint.notes || ""} ${maint.odometerKm ? `(${maint.odometerKm} km)` : ""}`.trim();

    const existing = await sqlMu`
      SELECT id FROM mufinance.transactions
      WHERE owner_uid = ${user.uid} AND (source_id = ${externalId} OR (notes LIKE ${`%${externalId}%`}))
      LIMIT 1
    `;

    if (!existing[0]) {
      const newId = crypto.randomUUID();
      await sqlMu`
        INSERT INTO mufinance.transactions
          (id, owner_uid, account_id, date, payee, category, amount, type, status, source_type, source_id, notes)
        VALUES
          (${newId}, ${user.uid}, ${defaultAccountId}, ${dateStr}, ${payee}, 'Transporte', ${amount}, 'expense', 'completed', 'account', ${externalId}, ${notes})
      `;
      await sqlMu`
        UPDATE mufinance.accounts
        SET balance = balance - ${amount}, updated_at = now()
        WHERE id = ${defaultAccountId} AND owner_uid = ${user.uid}
      `;
      importedToMuCount++;
    }
  }

  // 4. Exporta / Sincroniza Despesas de "Transporte" do MuFinance para o MotoTrack
  const transportTxs = await sqlMu`
    SELECT id, date, payee, category, amount, type, source_id, notes, status
    FROM mufinance.transactions
    WHERE owner_uid = ${user.uid}
      AND status = 'completed'
      AND type = 'expense'
      AND (lower(category) = 'transporte' OR lower(category) = 'combustível' OR lower(category) = 'veículo')
    ORDER BY date DESC
  `;

  let exportedToMotoCount = 0;
  const activeMotoId = payload.activeMotorcycleId || payload.motorcycles?.[0]?.id || "moto-default";

  for (const tx of transportTxs) {
    const txId = String(tx.id);
    const payeeLower = String(tx.payee || "").toLowerCase();
    const isFromMoto = tx.source_id && String(tx.source_id).startsWith("mototrack-");
    if (isFromMoto) continue; // Já veio do MotoTrack

    const amountNum = Number(tx.amount);
    const amountCents = Math.round(amountNum * 100);
    const txDate = tx.date ? String(tx.date).split("T")[0] : new Date().toISOString().split("T")[0];

    // Se o nome remeter a combustível ou posto, envia para fuelEntries
    const isFuel =
      payeeLower.includes("posto") ||
      payeeLower.includes("gasolina") ||
      payeeLower.includes("etanol") ||
      payeeLower.includes("combustivel") ||
      payeeLower.includes("combustível") ||
      payeeLower.includes("abastecimento") ||
      payeeLower.includes("shell") ||
      payeeLower.includes("ipiranga") ||
      payeeLower.includes("br branca") ||
      payeeLower.includes("petrobras");

    if (isFuel) {
      const alreadyInMoto = fuelEntries.some(
        (f: any) => f.mufinanceId === txId || (f.totalCents === amountCents && (f.date === txDate || f.dateLabel?.includes(txDate)))
      );
      if (!alreadyInMoto) {
        fuelEntries.unshift({
          id: `fuel-mu-${txId.slice(0, 8)}`,
          mufinanceId: txId,
          motorcycleId: activeMotoId,
          station: tx.payee || "Abastecimento",
          totalCents: amountCents,
          date: txDate,
          dateLabel: txDate,
          liters: Number((amountNum / 5.89).toFixed(2)), // Estimativa média de litros
          notes: tx.notes || "Lançado via MuFinance",
        });
        exportedToMotoCount++;
      }
    } else {
      // Caso contrário, entra como Manutenção / Despesa de Moto
      const alreadyInMoto = maintenance.some(
        (m: any) => m.mufinanceId === txId || ((m.costCents === amountCents || m.cost === amountNum) && (m.doneAt === txDate || m.date === txDate))
      );
      if (!alreadyInMoto) {
        maintenance.unshift({
          id: `maint-mu-${txId.slice(0, 8)}`,
          mufinanceId: txId,
          motorcycleId: activeMotoId,
          title: tx.payee || "Despesa Moto",
          cost: amountNum,
          costCents: amountCents,
          date: txDate,
          doneAt: txDate,
          status: "completed",
          category: "Outros",
          description: tx.notes || "Lançado via MuFinance",
          notes: tx.notes || "Lançado via MuFinance",
        });
        exportedToMotoCount++;
      }
    }
  }

  // Se houve novos lançamentos enviados para o MotoTrack, salva o snapshot atualizado no banco do MotoTrack
  if (exportedToMotoCount > 0) {
    payload.fuelEntries = fuelEntries;
    payload.maintenance = maintenance;

    await sqlMoto`
      UPDATE motogarage.garage_snapshots
      SET payload = ${JSON.stringify(payload)}::jsonb,
          updated_at = now()
      WHERE user_id = ${motoUserId}
    `;
  }

  revalidatePath("/");
  revalidatePath("/transactions");
  revalidatePath("/mototrack");

  return {
    ok: true,
    importedToMuCount,
    exportedToMotoCount,
    message: `Sincronização bidirecional concluída! Recebidos do MotoTrack: ${importedToMuCount} | Enviados ao MotoTrack: ${exportedToMotoCount}.`,
  };
}
