"use client";

import gitlab from "../../../public/gitlab-logo-500.svg";
import Image from "next/image";
import { Card, Typography } from "@material-tailwind/react";
import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";

export default function Project() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId");
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [rootPath, setRootPath] = useState("");
  const [selectedButton, setSelectedButton] = useState("");
  const [TABLE_ROWS_CR, setTableRowsCR] = useState([]);
  const TABLE_HEAD_CR = ["Name", "Type"];
  const router = useRouter();

  // Fetch project details
  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        const res = await fetch(`/api/project`);
        const data = await res.json();
        const project = data.find((proj) => proj._id === projectId);
        if (project) {
          setProjectName(project.projectName);
          setProjectDescription(project.projectDescription);
          setRootPath(project.rootPath);
        } else {
          console.error("Project not found");
        }
      } catch (error) {
        console.error("Failed to fetch project details:", error.message);
      }
    };

    fetchProjectDetails();
  }, [projectId]);

  // Fetch table rows for resources
  useEffect(() => {
    const fetchTableRows = async () => {
      try {
        const res = await fetch(`/api/resourcelist`);
        const data = await res.json();
        const resources = data.filter(
          (resource) => resource.projectid === projectId
        );
        const rows = resources.map((element) => ({
          id: element._id,
          name: element.vmname,
          type: element.type,
        }));
        setTableRowsCR(rows);
      } catch (error) {
        console.error("Failed to fetch resources:", error.message);
      }
    };

    fetchTableRows();
  }, [projectId]);

  // Fetch project status
  useEffect(() => {
    const fetchProjectStatus = async () => {
      try {
        const res = await fetch("/api/request");
        const data = await res.json();
        if (Array.isArray(data)) {
          const requests = data;
          const matchingRequest = requests.find(
            (item) => item.projectid === projectId
          );
          if (matchingRequest) {
            setSelectedButton(matchingRequest.statuspm);
          }
        }
      } catch (error) {
        console.error("Failed to retrieve request:", error.message);
      }
    };

    fetchProjectStatus();
  }, [projectId, TABLE_ROWS_CR]);

  // Handle delete action
  const handleDelete = async () => {
    toast.success("Destroy sent successfully");
    try {
      // Update Project request status
      const requestTypeData = {
        projectid: projectId,
        status: "destroy",
      };

      const resRequesttype = await fetch("/api/requesttype", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestTypeData),
      });

      if (!resRequesttype.ok) {
        const errorMessage = await resRequesttype.text();
        throw new Error(
          `RequestType API failed: ${resRequesttype.status} - ${errorMessage}`
        );
      }

      const projectData = {
        projectid: projectId,
        statuspm: "Pending",
        statusops: "Pending",
      };

      const resProject = await fetch("/api/project", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(projectData),
      });

      if (!resProject.ok) {
        const errorMessage = await resRequesttype.text();
        throw new Error(
          `Project API failed: ${resRequesttype.status} - ${errorMessage}`
        );
      }

      const resRequest = await fetch("/api/request", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(projectData),
      });

      if (!resRequest.ok) {
        const errorMessage = await resRequesttype.text();
        throw new Error(
          `Project API failed: ${resRequesttype.status} - ${errorMessage}`
        );
      }

      router.push("/projectlist");
    } catch (error) {
      console.error("Error while deleting resource:", error);
      toast.error("Failed to delete resource");
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-row justify-between items-center px-4 py-5">
        <div className="flex flex-row items-center space-x-8 ml-12">
          <p className="text-5xl font-bold">{projectName}</p>
          <span
            className={`rounded-2xl px-6 py-1 mt-3 ml-8 ${
              selectedButton === "Approved"
                ? "bg-green-500 text-white"
                : selectedButton === "Rejected"
                ? "bg-red-500 text-white"
                : selectedButton === "Under Review"
                ? "bg-amber-500 text-white"
                : "bg-gray-500 text-white"
            }`}
          >
            {selectedButton}
          </span>
        </div>
        <div className="flex flex-row items-center">
          <button
            className="text-sm text-white bg-red-500 rounded py-3 px-5 hover:bg-red-600 mr-14"
            onClick={handleDelete}
          >
            Destroy
          </button>
        </div>
      </div>

      {/* Project Details box */}
      <div className="bg-white mx-16 my-8 py-8 text-black text-xl rounded font-normal">
        {/* subtitle */}
        <div className="flex flex-row justify-between items-center">
          <p className="text-3xl font-semibold ml-4">Application Details</p>
        </div>
        {/* Project name, description and source */}
        <div className="grid grid-rows-1 grid-flow-col gap-3 items-top mt-10">
          <div>
            <p className="text-xl font-medium mx-16 mt-5">Application name</p>
            <p className="text-lg font-normal ml-16 mt-2">{projectName}</p>
          </div>
          <div>
            <p className="text-xl font-medium mx-16 mt-5">Description</p>
            <p className="text-lg font-normal ml-16 mt-2">
              {projectDescription}
            </p>
          </div>
          <div>
            <p className="text-xl font-medium mx-16 mt-5">Repository</p>
            <div className="flex flex-row mx-16">
              <Image src={gitlab} width="45" height="45" alt="logo" />
              <p className="text-lg font-normal flex items-center">
                {rootPath}
              </p>
            </div>
          </div>
        </div>

        {/* Cloud Resources */}
        <div className="grid grid-rows-[auto,auto] grid-flow-col mt-10">
          <div className="flex flex-row items-center h-12">
            <p className="text-xl font-medium ml-16 mr-5 mt-5">
              Cloud Resources
            </p>
          </div>

          {/* Cloud Resource list */}
          <Card className="overflow-hidden rounded-lg shadow-lg mx-16 mt-8">
            <table className="w-full min-w-max table-auto text-left">
              <thead>
                <tr>
                  {TABLE_HEAD_CR.map((head) => (
                    <th
                      key={head}
                      className="border-b border-blue-gray-100 bg-gray-100 p-4 text-black font-semibold"
                    >
                      <Typography variant="small" className="font-medium">
                        {head}
                      </Typography>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TABLE_ROWS_CR.map(({ id, name, type }, index) => {
                  const isOdd = index % 2 === 1;
                  const rowBgColor = isOdd ? "bg-gray-50" : "bg-white";
                  return (
                    <tr key={id} className={`${rowBgColor} cursor-pointer`}>
                      <td className="p-4 border-b border-blue-gray-50">
                        <Link
                          href={{
                            pathname: `/project/${projectId}`,
                            query: { requestId: projectId },
                          }}
                        >
                          <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal"
                          >
                            {name}
                          </Typography>
                        </Link>
                      </td>
                      <td className="p-4 border-b border-blue-gray-50">
                        <Link
                          href={{
                            pathname: `/project/${projectId}`,
                            query: { requestId: projectId },
                          }}
                        >
                          <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal"
                          >
                            {type}
                          </Typography>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
        </div>
      </div>
    </div>
  );
}
