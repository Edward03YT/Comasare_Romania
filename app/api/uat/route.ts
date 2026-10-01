import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const scop = searchParams.get('scop') || 'arges';
  const judet = searchParams.get('judet');

  const filename = scop === 'national' ? 'uat_national.json' : 'uat_arges.json';
  const filePath = path.join(process.cwd(), 'public', 'data', filename);

  try {
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const geojson = JSON.parse(fileContent);

    if (judet && scop === 'national') {
      const filtered = geojson.features.filter(
        (f: any) => f.properties.judet.toUpperCase() === judet.toUpperCase()
      );
      return NextResponse.json({ type: 'FeatureCollection', features: filtered });
    }

    return NextResponse.json(geojson);
  } catch (error) {
    return NextResponse.json(
      { error: `Eroare la încărcarea setului de date: ${error}` },
      { status: 500 }
    );
  }
}
