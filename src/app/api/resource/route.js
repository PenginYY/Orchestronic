import { connectMongoDB } from "../../../../lib/mongodb";
import Resource from "../../../../models/resource";
import { NextResponse } from "next/server";
import { URL } from "url";

export async function POST(req) {
  // Parse JSON
  const {
    userID,
    resourceName,
    region,
    os,
    type,
    adminUser,
    adminPassword,
    vmSize,
    allocation,
    projectID,
  } = await req.json();

  // Connect to MongoDB
  await connectMongoDB();

  // Create environment details
  await Resource.create({
    userid: userID,
    vmname: resourceName,
    vmsize: vmSize,
    region,
    os,
    type,
    username: adminUser,
    password: adminPassword,
    allocationip: allocation,
    projectid: projectID,
  });

  return NextResponse.json(
    { message: "Successfully added resource" },
    { status: 201 }
  );
}

export async function GET(req) {
  try {
    await connectMongoDB();
    // console.log("Connected to MongoDB");

    const url = new URL(req.url);
    const requestId = url.searchParams.get("requestId");
    const projectRequest = url.searchParams.get("projectRequest");

    const query = {};

    // Add filters dynamically
    if (requestId) {
      query._id = requestId;
    }
    if (projectRequest) {
      query.projectid = projectRequest;
    }
    const resources = await Resource.find(query);

    return NextResponse.json(resources, { status: 200 });
  } catch (error) {
    console.error("Error fetching resources:", error);

    return NextResponse.json(
      { message: "Error fetching resources", error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  // Connect to MongoDB
  await connectMongoDB();

  // Parse JSON
  const url = new URL(req.url);
  const requestId = url.searchParams.get("requestId");

  // Delete resource
  await Resource.deleteOne({ _id: requestId });

  return NextResponse.json(
    { message: "Successfully deleted resource" },
    { status: 200 }
  );
}
