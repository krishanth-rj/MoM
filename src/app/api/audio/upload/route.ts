import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const audioFile = formData.get("audio") as File | null;
    const meetingId = formData.get("meeting_id") as string | null;

    if (!audioFile || !meetingId) {
      return NextResponse.json(
        { error: "audio file and meeting_id are required" },
        { status: 400 },
      );
    }

    // Verify meeting exists and belongs to the authenticated user
    const { data: meeting, error: meetingError } = await supabase
      .from("meetings")
      .select("meeting_id")
      .eq("meeting_id", meetingId)
      .eq("user_id", user.id)
      .single();

    if (meetingError || !meeting) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    }

    // Use admin client for storage operations (bypasses RLS on storage.objects)
    const adminSupabase = createAdminClient();

    // Upload to Supabase Storage
    const bucket = process.env.SUPABASE_AUDIO_BUCKET || "meeting-audio";
    const ext = audioFile.name.split(".").pop() || "webm";
    const storagePath = `${meetingId}/upload-${Date.now()}.${ext}`;

    const { error: uploadError } = await adminSupabase.storage
      .from(bucket)
      .upload(storagePath, audioFile, {
        contentType: audioFile.type || "audio/webm",
        upsert: true,
      });

    if (uploadError) {
      return NextResponse.json(
        { error: `Storage upload failed: ${uploadError.message}` },
        { status: 500 },
      );
    }

    // Create audio_files database record (use admin client to bypass RLS)
    const { data: audioRecord, error: dbError } = await adminSupabase
      .from("audio_files")
      .insert({
        meeting_id: meetingId,
        storage_url: storagePath,
        file_name: audioFile.name,
        file_size: audioFile.size,
      })
      .select()
      .single();

    if (dbError || !audioRecord) {
      // Clean up the uploaded file
      await adminSupabase.storage.from(bucket).remove([storagePath]);
      return NextResponse.json(
        { error: dbError?.message || "Failed to create audio record" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      audio_file_id: audioRecord.file_id,
      storage_url: storagePath,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
