import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const scop = searchParams.get('scop') || 'arges';

  const filename = scop === 'national' ? 'adiacenta_national.json' : 'adiacenta_arges.json';
  const filePath = path.join(process.cwd(), 'public', 'data', filename);

  try {
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const adiacenta = JSON.parse(fileContent);
    return NextResponse.json(adiacenta);
  } catch (error) {
    return NextResponse.json(
      { error: `Eroare la încărcarea grafului de adiacență: ${error}` },
      { status: 500 }
    );
  }
}
