"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";

export default function Projectdetails() {
  const searchParams = useSearchParams();
  const requestId = searchParams.get("requestId"); // Get the requestId from the query

  const [projectDetails, setProjectDetails] = useState({
    _id: "",
    projectName: "",
    projectDescription: "",
    lastUpdate: "",
  });

  const [resource, setResource] = useState({
    resourceName: "",
    region: "",
    os: "",
    adminUser: "",
    adminPassword: "",
    vmSize: "",
    allocation: "",
    type: "Virtual Machine",
  });

  const [rg, setRG] = useState({
    rgName: "",
  });

  const [connectionStatus, setConnectionStatus] = useState("idle");
  const [showPassword, setShowPassword] = useState(false);

  const fetchProjectDetails = async () => {
    try {
      const res = await fetch(`/api/project/?projectId=${requestId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch project: ${res.statusText}`);
      }

      const data = await res.json();

      if (data.length > 0) {
        const project = data[0];
        setProjectDetails({
          _id: project._id,
          projectName: project.projectName, // Fixed field names
          projectDescription: project.projectDescription,
          lastUpdate: project.lastUpdate,
          pathWithNamespace: project.pathWithNamespace,
        });
      } else {
        console.log("No project found for this projectId.");
      }
    } catch (error) {
      console.error("Error fetching project details:", error);
      toast.error("Failed to load project details.");
    }
  };

  // const fetchRequestStatus = async () => {
  //     try {
  //         const res = await fetch(`/api/request/?projectId=${requestId}`, {
  //             method: "GET",
  //             headers: { "Content-Type": "application/json" },
  //         });

  //         if (!res.ok) {
  //             throw new Error(`Failed to fetch request: ${res.statusText}`);
  //         }

  //         const data = await res.json();
  //         console.log("Request Data:", data);

  //         if (data.length > 0) {
  //             const request = data[0];
  //             setRequestStatus(request.status);
  //         } else {
  //             console.log("No request found for this projectId.");
  //         }
  //     } catch (error) {
  //         console.error("Error fetching request details:", error);
  //         toast.error("Failed to load request details.");
  //     }
  // };

  const fetchResource = async () => {
    try {
      const res = await fetch(`/api/resource/?requestId=${requestId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch resource: ${res.statusText}`);
      }

      const data = await res.json();
      console.log("data", data);

      if (data.length > 0) {
        const resource = data[0];
        setResource({
          resourceName: resource.vmname,
          region: resource.region,
          os: resource.os,
          adminUser: resource.username,
          adminPassword: resource.password,
          vmSize: resource.vmsize,
          allocation: resource.allocationip,
          type: resource.type,
        });

        // console.log("Fetched Data:", data);
      } else {
        console.log("No resource found for this requestId.");
      }
    } catch (error) {
      console.log("Error while fetching resource data:", error);
    }
  };

  useEffect(() => {
    if (requestId) {
      fetchProjectDetails();
    }
  }, [requestId]);

  useEffect(() => {
    if (requestId) {
      fetchResource();
    }
  }, [requestId, fetchResource]);

  // useEffect(() => {
  //     if (requestId) {
  //         fetchRequestStatus();
  //     }
  // }, [requestId]);

  useEffect(() => {
    if (projectDetails._id) {
      setRG({
        rgName: `rg-${projectDetails._id}`, // Format: rg-<projectId>
      });
    }
  }, [projectDetails._id]);

  const handleConnectVM = async () => {
    const { resourceName, os, adminUser, adminPassword } = resource;
    const { rgName } = rg;

    try {
      // Show loading toast
      const loadingToast = toast.loading("Checking resources in Azure...");

      // Call your API endpoint
      const response = await fetch("/api/connect-vm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resourceName, rgName, os }),
      });

      // Parse the response first
      const data = await response.json();
      toast.dismiss(loadingToast);

      // Handle resource not found scenarios
      if (!response.ok) {
        if (response.status === 404) {
          if (data.resourceGroupExists === false) {
            toast.error(`Resource group '${rgName}' doesn't exist in Azure`);
          } else if (data.vmExists === false) {
            toast.error(
              `VM '${resourceName}' doesn't exist in resource group '${rgName}'`
            );
          } else {
            toast.error(data.message || "Resource not found");
          }
          return;
        }

        // Other errors
        throw new Error(data.message || "Failed to connect to VM");
      }

      if (data.success) {
        toast.success(
          `VM '${resourceName}' found in Azure and ready to connect`
        );
        const { publicIP } = data.vmDetails;

        // For Linux VMs, provide SSH command
        if (os.toLowerCase().includes("linux")) {
          const sshCommand = `ssh ${adminUser}@${publicIP}`;
          toast.success(`Run this command to connect: ${sshCommand}`);

          // Copy to clipboard
          navigator.clipboard
            .writeText(sshCommand)
            .then(() => toast.success("SSH command copied to clipboard"))
            .catch(() => console.error("Failed to copy command"));
        }

        // For Windows VMs, generate RDP file
        else if (os.toLowerCase().includes("windows")) {
          const rdpContent = `
                full address:s:${publicIP}
                username:s:${adminUser}
                password:s:${adminPassword}
              `;

          // Download RDP file
          const blob = new Blob([rdpContent], { type: "application/rdp" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `${resourceName}.rdp`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);

          toast.success("RDP file downloaded. Open it to connect to the VM.");
        } else {
          toast.error("Unsupported OS for connection.");
        }
      } else {
        toast.error("Failed to get VM connection details.");
      }
    } catch (error) {
      console.error("Error connecting to VM:", error);
      toast.error(error.message || "Failed to connect to VM.");
    }
  };

  return (
    <div>
      {/* Details Box */}
      <div className="flex flex-row items-center">
        <h1 className="text-5xl font-bold mx-16 my-5">
          {projectDetails.projectName}
        </h1>
      </div>
      {/* Project Details box */}
      <div className="bg-white mx-16 my-8 py-8 text-black text-xl rounded-2xl font-normal">
        {/* subtitle */}
        <div className="flex flex-row justify-between items-center">
          <h1 className="text-3xl font-semibold ml-4">Details</h1>
        </div>
        {/* Project name, description and source */}
        <div className="grid grid-rows-1 grid-flow-col gap-3 items-top mx-2">
          <div>
            <p className="text-xl font-medium ml-5 -16 mt-5">
              Application name
            </p>
            <p className="text-lg font-normal ml-5 mt-2">
              {projectDetails.projectName}
            </p>
          </div>
          <div>
            <p className="text-xl font-medium mx-16 mt-5">Description</p>
            <p className="text-lg font-normal ml-16 mt-2">
              {projectDetails.projectDescription}
            </p>
          </div>
          {/* <div>
            <p className="text-xl font-medium mx-16 mt-5">Last Update</p>
            <p className="text-lg font-normal ml-16 mt-2">{projectDetails.lastUpdate}</p>
          </div> */}
          <div>
            <p className="text-xl font-medium mx-16 mt-5">Create By</p>
            <p className="text-lg font-normal ml-16 mt-2">
              {projectDetails.pathWithNamespace}
            </p>
          </div>
        </div>
      </div>

      {/* Cloud Resources Box */}
      <div className="bg-white mx-16 my-8 py-8 text-black text-xl rounded-2xl font-normal">
        <div className="flex flex-row justify-between items-center">
          <h1 className="text-3xl font-semibold ml-4">Cloud Resources</h1>
          <div className="flex flex-row justify-between items-center px-4">
            {/* <button
              className="text-sm text-black bg-[#E3E3E3] rounded py-3 px-5"
              // onClick={}
            >
              Configure
            </button>  */}
            <button
              className={`ml-4 text-sm text-white rounded py-3 px-5 ${
                connectionStatus === "connecting"
                  ? "bg-blue-400"
                  : connectionStatus === "connected"
                  ? "bg-green-500"
                  : connectionStatus === "failed"
                  ? "bg-red-500"
                  : "bg-blue-500 hover:bg-blue-600"
              }`}
              onClick={handleConnectVM}
              disabled={connectionStatus === "connecting"}
            >
              {connectionStatus === "connecting"
                ? "Connecting..."
                : connectionStatus === "connected"
                ? "Connected"
                : connectionStatus === "failed"
                ? "Connection Failed"
                : "Connect"}
            </button>
          </div>
        </div>

        <div className="ml-20 mt-5">
          {/* <p className="text-xl font-semibold">Create Resource Group</p> */}
          <div className="flex flex-col space-y-4 mt-4">
            <div className="flex flex-row">
              <p className="text-lg font-semibold w-32">Name</p>
              <p className="text-lg font-light items-center">
                {resource.resourceName}
              </p>
            </div>

            <div className="flex flex-row items-center">
              <p className="text-lg font-semibold w-32">VM Type</p>
              <p className="text-lg font-light">{resource.type}</p>
            </div>

            <div className="flex flex-row items-center">
              <Link href="/vmexplanation">
                <p className="text-lg text-blue-700 font-semibold w-32">
                  VM Size
                </p>
              </Link>
              <p className="text-lg font-light">{resource.vmSize}</p>
            </div>

            <div className="flex flex-row items-center">
              <p className="text-lg font-semibold w-32">Region</p>
              <p className="text-lg font-light">{resource.region}</p>
            </div>

            <div className="flex flex-row items-center">
              <p className="text-lg font-semibold w-32">Admin Username</p>
              <p className="text-lg font-light">{resource.adminUser}</p>
            </div>

            <div className="flex flex-row items-center">
              <p className="text-lg font-semibold w-32">Admin Password</p>
              <div className="flex items-center">
                <p className="text-lg font-light mr-2">
                  {showPassword ? resource.adminPassword : "••••••••••••"}
                </p>
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-xs px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
                <button
                  onClick={() =>
                    navigator.clipboard.writeText(resource.adminPassword)
                  }
                  className="text-xs px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 ml-2"
                >
                  Copy
                </button>
              </div>
            </div>

            <div className="flex flex-row items-center">
              <p className="text-lg font-semibold w-32">Operating System</p>
              <p className="text-lg font-light">{resource.os}</p>
            </div>

            <div className="flex flex-row items-center">
              <p className="text-lg font-semibold w-32">
                Private IP Allocation
              </p>
              <p className="text-lg font-light">{resource.allocation}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
