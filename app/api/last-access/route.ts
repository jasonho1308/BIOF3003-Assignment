import { dbConnect } from "@/app/db/mongodb";
import Record from "@/app/models/Record";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get('subjectId');

    if (!subjectId) {
        return NextResponse.json({ success: false, error: 'Missing subjectId' });
    }

    try {
        const lastRecord = await Record.findOne({ subjectId }).sort({ timestamp: -1 });
        if (!lastRecord) {
            return NextResponse.json({ success: false, error: 'No records found' });
        }

        return NextResponse.json({ success: true, lastAccess: lastRecord.timestamp });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message });
    }
}