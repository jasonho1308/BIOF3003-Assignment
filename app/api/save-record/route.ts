// app/api/save-record/route.ts
import { NextResponse } from 'next/server';
import Record from '@/app/models/Record';
import { dbConnect } from '@/app/db/mongodb';


// POST /api/save-record
export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();

    // Create a new record including the entire ppgData array
    const newRecord = await Record.create({
      heartRate: body.heartRate,
      hrv: body.hrv,
      ppgData: body.ppgData, // The whole ppgData array is posted here
      subjectId: body.subjectId || '',
      timestamp: body.timestamp || new Date(),
    });

    return NextResponse.json(
      { success: true, data: newRecord },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
