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

export async function GET(request: Request) {
  try {
    await dbConnect();

    // Extract subjectId from query parameters
    const url = new URL(request.url);
    const subjectId = url.searchParams.get('subjectId');

    if (!subjectId) {
      return NextResponse.json(
        { success: false, error: 'Missing subjectId in query parameters' },
        { status: 400 }
      );
    }

    // Aggregate historical data using MongoDB aggregation pipeline
    const pipeline = [
      {
        $match: { subjectId }, // Filter records by subjectId
      },
      {
        $group: {
          _id: null,
          avgHeartRate: { $avg: '$heartRate.bpm' },
          avgHRV: { $avg: '$hrv.sdnn' },
        },
      },
    ];

    const result = await Record.aggregate(pipeline);

    if (!result.length) {
      // Return default values if no data exists for the subjectId
      return NextResponse.json(
        { success: true, avgHeartRate: 0, avgHRV: 0 },
        { status: 200 }
      );
    }

    const { avgHeartRate, avgHRV } = result[0];
    return NextResponse.json(
      { success: true, avgHeartRate, avgHRV },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
