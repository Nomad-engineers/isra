import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    console.log('=== ROOM BANNER UPLOAD REQUEST START ===');
    const formData = await request.formData();
    console.log('FormData entries count:', formData.entries.length);

    const file = formData.get('file') as File;
    console.log('File from formData:', {
      file: file ? 'exists' : 'null',
      name: file?.name,
      type: file?.type,
      size: file?.size
    });

    if (!file) {
      console.log('ERROR: No file provided');
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    console.log('Received file:', {
      name: file.name,
      type: file.type,
      size: file.size,
      sizeInKB: Math.round(file.size / 1024)
    });

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPG, PNG, and WEBP are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5MB.' },
        { status: 400 }
      );
    }

    // Check if file is empty
    if (file.size === 0) {
      return NextResponse.json(
        { error: 'File is empty. Please select a valid image file.' },
        { status: 400 }
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'room-banners');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.type.split('/')[1];
    const filename = `room-banner-${timestamp}-${randomString}.${fileExtension}`;

    // Save file to filesystem
    const filepath = join(uploadsDir, filename);
    await writeFile(filepath, buffer);

    // Create public URL
    const publicUrl = `/uploads/room-banners/${filename}`;

    console.log('Room banner uploaded successfully:', {
      filename,
      filepath,
      size: file.size,
      type: file.type
    });

    // Return success response with file URL
    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename: filename,
      size: file.size,
      type: file.type
    });

  } catch (error) {
    console.error('Room banner upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload room banner: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}