import axios from "axios";
import { NextResponse } from "next/server";

export async function POST(req, res) {
  const { searchParams } = new URL(req.url);
  const dagId = searchParams.get("dagId");
  const projectId = searchParams.get("projectId");

  console.log("Triggering DAG:", dagId, "for Project:", projectId);

  try {
    const response = await axios.post(
      `https://orchestronic-airflow-webserver.salmongrass-fd8429f5.southeastasia.azurecontainerapps.io/api/v1/dags/${dagId}/dagRuns`,
      {
        conf: { projectId }, // Pass projectId as part of DAG configuration
      },
      {
        auth: {
          username: process.env.AIRFLOW_USERNAME,
          password: process.env.AIRFLOW_PASSWORD,
        },
      }
    );

    return NextResponse.json({ success: true, data: response.data });
  } catch (error) {
    console.error(error.response?.data || error.message);
    return NextResponse.json({
      success: false,
      error: error.response?.data || error.message,
    });
  }
}
