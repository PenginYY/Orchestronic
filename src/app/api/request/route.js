import { connectMongoDB } from "../../../../lib/mongodb";
import Request from "../../../../models/request";
import { NextResponse } from "next/server";

export async function GET(req) {
  // Connect to MongoDB
  await connectMongoDB();

  const url = new URL(req.url);
  const projectid = url.searchParams.get("projectId");

  const query = projectid ? { projectid } : {};

  // Retrieve all requests
  const requests = await Request.find(query);

  return NextResponse.json(requests, { status: 200 }); // return NextResponse.json({ requests }, { status: 200 });
}

export async function POST(req) {
  const resources = await req.json(); // Parse JSON array
  // console.log("Incoming Requests:", resources);

  // Connect to MongoDB
  await connectMongoDB();

  // Save each resource
  const requests = await Request.insertMany(
    resources.map(
      ({ id, name, type, userid, projectid, statuspm, statusops }) => ({
        requestid: id,
        name,
        type,
        userid,
        projectid,
        statuspm,
        statusops,
      })
    )
  );

  return NextResponse.json(
    { message: "Successfully added requests", requests },
    { status: 201 }
  );
}

export async function PUT(req) {
  try {
    const { projectid, ...updates } = await req.json();
    console.log("Updating Project:", projectid, updates);

    // Connect to MongoDB
    await connectMongoDB();

    // Validate input
    if (!projectid || Object.keys(updates).length === 0) {
      return NextResponse.json(
        { message: "Project ID and update fields are required" },
        { status: 400 }
      );
    }

    // Perform the update and return the updated document
    const updatedProject = await Request.findOneAndUpdate(
      { projectid },
      { $set: updates },
      { new: true } // Return the updated document
    );

    if (!updatedProject) {
      return NextResponse.json(
        { message: "Project not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Successfully updated request", updatedProject },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating project:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  await connectMongoDB();

  const url = new URL(req.url);
  const projectid = url.searchParams.get("projectId");

  if (!projectid) {
    return NextResponse.json(
      { message: "Missing required fields" },
      { status: 400 }
    );
  }

  await Request.deleteMany({ projectid });
  return NextResponse.json(
    { message: "Request type deleted successfully" },
    { status: 200 }
  );
}
