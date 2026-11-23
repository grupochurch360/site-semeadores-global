import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import type { AddressInfo } from 'node:net';
import { hashPassword, verifyPassword, signSessionToken, verifySessionToken } from './auth.ts';
import { createApp, getBimesterDateRange } from './app.ts';
import { db } from './db.ts';
import { reconcileStructuredReportWithDb, buildFallbackStructuredReport, parsePeriodMetadata } from './reportTemplate.ts';

test('hashPassword and verifyPassword validate matching passwords and reject wrong ones', () => {
  const hash = hashPassword('MinhaSenhaForte!2026');
  assert.ok(hash.includes(':'));
  assert.equal(verifyPassword('MinhaSenhaForte!2026', hash), true);
  assert.equal(verifyPassword('SenhaErrada', hash), false);
});

test('signSessionToken and verifySessionToken reject tampered tokens', () => {
  const token = signSessionToken({ id: 'usr-test', role: 'regional_coordinator', regionId: 'reg-sp' });
  const verified = verifySessionToken(token);
  assert.ok(verified);
  assert.equal(verified.sub, 'usr-test');
  assert.equal(verified.regionId, 'reg-sp');

  const tampered = `${token.slice(0, -4)}xxxx`;
  assert.equal(verifySessionToken(tampered), null);
});

test('getBimesterDateRange computes exact UTC boundaries for bimesters', () => {
  const range5 = getBimesterDateRange('5º Bimestre (Set/Out 2026)', 2026);
  assert.ok(range5);
  assert.equal(range5.start.toISOString(), '2026-09-01T00:00:00.000Z');
  assert.equal(range5.end.toISOString(), '2026-10-31T23:59:59.999Z');

  const range1 = getBimesterDateRange('1º Bimestre', 2026);
  assert.ok(range1);
  assert.equal(range1.start.toISOString(), '2026-01-01T00:00:00.000Z');
  assert.equal(range1.end.toISOString(), '2026-02-28T23:59:59.999Z');
});

test('API enforces auth, rate limiting, user deactivation, LGPD erasure, regional isolation, Zod validation & AI history', async () => {
  const dbPath = path.resolve(process.cwd(), 'data', 'database.json');
  const backupRaw = fs.existsSync(dbPath) ? fs.readFileSync(dbPath, 'utf-8') : null;

  const app = createApp({ loginMaxAttempts: 3, useLiveAI: false });
  const server = app.listen(0);
  const { port } = server.address() as AddressInfo;
  const baseUrl = `http://127.0.0.1:${port}`;
  const defaultPassword = process.env.DEFAULT_DEV_PASSWORD || 'Semeadores@2026';

  try {
    // 1. Unauthenticated request must return 401
    const unauthRes = await fetch(`${baseUrl}/api/reports`);
    assert.equal(unauthRes.status, 401);

    // 2. Rate limiting blocks repeated invalid logins with 429
    for (let i = 0; i < 3; i++) {
      const badLogin = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'bruteforce@semeadoresdefogo.org', password: 'wrong' }),
      });
      assert.equal(badLogin.status, 401);
    }
    const rateLimited = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'bruteforce@semeadoresdefogo.org', password: 'wrong' }),
    });
    assert.equal(rateLimited.status, 429);

    // 3. Login as SP Regional Coordinator
    const loginSpRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'marcos.sp@semeadoresdefogo.org', password: defaultPassword }),
    });
    assert.equal(loginSpRes.status, 200);
    const loginSpData = (await loginSpRes.json()) as { token: string; user: { role: string; passwordHash?: string } };
    assert.ok(loginSpData.token);
    assert.equal(loginSpData.user.passwordHash, undefined);
    const spHeaders = { Authorization: `Bearer ${loginSpData.token}`, 'Content-Type': 'application/json' };

    // 4. SP Coordinator isolated on reports, members, and crusades
    const crossReports = await fetch(`${baseUrl}/api/reports?regionId=reg-mg`, { headers: spHeaders });
    assert.equal(crossReports.status, 403);

    const crossMembers = await fetch(`${baseUrl}/api/members?regionId=reg-mg`, { headers: spHeaders });
    assert.equal(crossMembers.status, 403);

    const crossCrusades = await fetch(`${baseUrl}/api/crusades?regionId=reg-mg`, { headers: spHeaders });
    assert.equal(crossCrusades.status, 403);

    // 5. Own password change works
    const changePwRes = await fetch(`${baseUrl}/api/auth/password`, {
      method: 'PUT',
      headers: spHeaders,
      body: JSON.stringify({ currentPassword: defaultPassword, newPassword: 'NovaSenhaForte!2026' }),
    });
    assert.equal(changePwRes.status, 200);

    // 6. LGPD consolidation contact create + update + erase
    const badConsentRes = await fetch(`${baseUrl}/api/consolidation`, {
      method: 'POST',
      headers: spHeaders,
      body: JSON.stringify({
        fullName: 'Teste Sem Consentimento',
        phone: '11999990000',
        consentGranted: true,
        sensitiveReligiousConsentGranted: false,
      }),
    });
    assert.equal(badConsentRes.status, 400);

    const createdContactRes = await fetch(`${baseUrl}/api/consolidation`, {
      method: 'POST',
      headers: spHeaders,
      body: JSON.stringify({
        fullName: 'Maria LGPD Teste',
        phone: '11988887777',
        consentGranted: true,
        sensitiveReligiousConsentGranted: true,
      }),
    });
    assert.equal(createdContactRes.status, 201);
    const createdContact = (await createdContactRes.json()) as { id: string };

    const eraseRes = await fetch(`${baseUrl}/api/consolidation/${createdContact.id}`, {
      method: 'DELETE',
      headers: spHeaders,
    });
    assert.equal(eraseRes.status, 200);

    // 7. Login as Global Admin
    const loginAdminRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'lucas@semeadoresdefogo.org', password: defaultPassword }),
    });
    assert.equal(loginAdminRes.status, 200);
    const adminData = (await loginAdminRes.json()) as { token: string };
    const adminHeaders = { Authorization: `Bearer ${adminData.token}`, 'Content-Type': 'application/json' };

    // 8. Zod validation rejects invalid user payload
    const badUserRes = await fetch(`${baseUrl}/api/users`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({ name: 'A', email: 'invalido', password: '123', role: 'global_admin' }),
    });
    assert.equal(badUserRes.status, 400);

    // 9. Create + deactivate user immediately invalidates their token
    const newUserRes = await fetch(`${baseUrl}/api/users`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({
        name: 'Líder Temporário',
        email: 'temp.lider@semeadoresdefogo.org',
        password: 'TempPassword123',
        role: 'evangelism_leader',
        regionId: 'reg-sp',
      }),
    });
    assert.equal(newUserRes.status, 201);
    const tempUser = (await newUserRes.json()) as { id: string };

    const tempLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'temp.lider@semeadoresdefogo.org', password: 'TempPassword123' }),
    });
    assert.equal(tempLoginRes.status, 200);
    const tempLogin = (await tempLoginRes.json()) as { token: string };

    const deactivateRes = await fetch(`${baseUrl}/api/users/${tempUser.id}`, {
      method: 'DELETE',
      headers: adminHeaders,
    });
    assert.equal(deactivateRes.status, 200);

    const revokedAccess = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${tempLogin.token}` },
    });
    assert.equal(revokedAccess.status, 401);

    // 10. AI analysis returns official structured template HTML and updates when new data arrives
    const aiRes = await fetch(`${baseUrl}/api/ai/analyze-reports`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({ targetPeriod: '5º Bimestre' }),
    });
    assert.equal(aiRes.status, 200);
    const aiData1 = (await aiRes.json()) as {
      id: string;
      html: string;
      dataFingerprint: string;
      analyzedReportsCount: number;
      reportData: { regionais: Array<{ nome: string }> };
    };
    assert.ok(aiData1.html.includes('<script id="report-data" type="application/json">'));
    assert.ok(aiData1.reportData.regionais.length >= 2);

    // Add a new bimonthly report and verify AI report automatically updates with new data
    const newRepRes = await fetch(`${baseUrl}/api/reports`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({
        regionId: 'reg-rj',
        period: '5º Bimestre (Set/Out 2026)',
        year: 2026,
        evangelismsCount: 4,
        totalParticipantsSum: 50,
        totalSoulsReached: 120,
        authorizedContactsCount: 40,
        strengths: 'Forte mobilização na orla do Rio de Janeiro.',
      }),
    });
    assert.equal(newRepRes.status, 201);

    const aiRes2 = await fetch(`${baseUrl}/api/ai/analyze-reports`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({ targetPeriod: '5º Bimestre' }),
    });
    assert.equal(aiRes2.status, 200);
    const aiData2 = (await aiRes2.json()) as {
      dataFingerprint: string;
      analyzedReportsCount: number;
      html: string;
    };
    assert.notEqual(aiData2.dataFingerprint, aiData1.dataFingerprint);
    assert.equal(aiData2.analyzedReportsCount, aiData1.analyzedReportsCount + 1);
    assert.ok(aiData2.html.includes('Rio de Janeiro'));

    const historyRes = await fetch(`${baseUrl}/api/ai/analyses`, { headers: adminHeaders });
    assert.equal(historyRes.status, 200);
    const history = (await historyRes.json()) as Array<{ id: string }>;
    assert.ok(history.length >= 2);

    // 11. Updating report text or adding a completed evangelism updates dataFingerprint, and '$' in text is preserved
    const updateTextRes = await fetch(`${baseUrl}/api/reports/rep-sp-05-2026`, {
      method: 'PUT',
      headers: adminHeaders,
      body: JSON.stringify({
        activitiesDescription: 'Ação especial com custo R$ 150,00 e $$ teste de substituição.',
      }),
    });
    assert.equal(updateTextRes.status, 200);

    const aiRes3 = await fetch(`${baseUrl}/api/ai/analyze-reports`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({ targetPeriod: '5º Bimestre' }),
    });
    assert.equal(aiRes3.status, 200);
    const aiData3 = (await aiRes3.json()) as {
      dataFingerprint: string;
      html: string;
    };
    assert.notEqual(aiData3.dataFingerprint, aiData2.dataFingerprint);
    assert.ok(aiData3.html.includes('R$ 150,00 e $$ teste de substituição.'));

    // 12. reconcileStructuredReportWithDb overrides stale AI numbers with live DB values
    const liveReports = db.get('bimonthly_reports').filter((r) => r.period.includes('5º Bimestre'));
    const liveRegions = db.get('regions');
    const staleAiReport = buildFallbackStructuredReport(liveReports, liveRegions, parsePeriodMetadata('5º Bimestre'));
    staleAiReport.regionais[0].almas = 1;
    staleAiReport.regionais[0].acoes = 0;
    const reconciled = reconcileStructuredReportWithDb(staleAiReport, liveReports, liveRegions);
    assert.equal(reconciled.regionais[0].almas, liveReports[0].totalSoulsReached);
    assert.equal(reconciled.regionais[0].acoes, liveReports[0].evangelismsCount);
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
    if (backupRaw !== null) {
      db.saveDatabase(JSON.parse(backupRaw));
    }
  }
});
