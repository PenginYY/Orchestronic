"use client";

import Image from "next/image";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Azure from "../../../public/azure-logo.png";
import { useRouter } from "next/navigation";
import { useProvider } from "../components/ConText";

export default function CloudResources({ params }) {
  const { projectData } = useProvider();
  const router = useRouter();
  const [resourceName, setResourceName] = useState("");
  const [region, setRegion] = useState("East Asia");
  const [os, setOS] = useState("Ubuntu");
  const [adminUser, setAdminUser] = useState("Admin");
  const [adminPassword, setAdminPassword] = useState("");
  const [vmSize, setVMSize] = useState("");
  const [allocation, setAllocation] = useState("");
  const [alert, setAlert] = useState("");
  const [availableVM, setAvailableVM] = useState([]);
  const [warning, setWarning] = useState("");
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [pathWithNamespace, setPathWithNamespace] = useState("");
  /* 
  UserID may refer to the email or ID 
  indicating the specified user owns the project.
  */
  const [userID, setUserID] = useState("");
  const [type, setType] = useState("Virtual Machine");
  /*
  Project ID will be based on the created project.  
  For example, a to-do list, the ID will correspond to the to-do list to indicate that the resources come from the specified project.
  */
  const [projectID, setProjectID] = useState("");

  const regions = [
    {
      title: "Asia-Pacific",
      options: [{ value: "East Asia", label: "East Asia" }],
    },
    {
      title: "United States",
      options: [
        { value: "East US", label: "East US" },
        { value: "East US 2", label: "East US 2" },
        { value: "North Central US", label: "North Central US" },
        { value: "West US 2", label: "West US 2" },
        { value: "West US 3", label: "West US 3" },
      ],
    },
    {
      title: "Europe",
      options: [
        { value: "North Europe (Ireland)", label: "North Europe (Ireland)" },
      ],
    },
    {
      title: "France",
      options: [{ value: "France Central", label: "France Central" }],
    },
    {
      title: "Germany",
      options: [
        { value: "Germany West Central", label: "Germany West Central" },
      ],
    },
  ];

  const vmSizeOptions = [
    {
      title: "Family A (Av2-series)",
      options: [
        {
          value: "Standard_A1_v2",
          label: "Standard_A1_v2",
          cpu: "1",
          memory: "2GB",
        },
        {
          value: "Standard_A2_v2",
          label: "Standard_A2_v2",
          cpu: "2",
          memory: "4GB",
        },
        {
          value: "Standard_A4_v2",
          label: "Standard_A4_v2",
          cpu: "4",
          memory: "8GB",
        },
        {
          value: "Standard_A8_v2",
          label: "Standard_A8_v2",
          cpu: "8",
          memory: "16GB",
        },
        {
          value: "Standard_A2m_v2",
          label: "Standard_A2m_v2",
          cpu: "2",
          memory: "16GB",
        },
        {
          value: "Standard_A4m_v2",
          label: "Standard_A4m_v2",
          cpu: "4",
          memory: "32GB",
        },
        {
          value: "Standard_A8m_v2",
          label: "Standard_A8m_v2",
          cpu: "8",
          memory: "64GB",
        },
      ],
    },
    {
      title: "Family B (Basv2-series)",
      options: [
        {
          value: "Standard_B2ts_v2",
          label: "Standard_B2ts_v2",
          cpu: "2",
          memory: "1GB",
        },
        {
          value: "Standard_B2ls_v2",
          label: "Standard_B2ls_v2",
          cpu: "2",
          memory: "4GB",
        },
        {
          value: "Standard_B2s_v2",
          label: "Standard_B2s_v2",
          cpu: "2",
          memory: "8GB",
        },
        {
          value: "Standard_B4ls_v2",
          label: "Standard_B4ls_v2",
          cpu: "4",
          memory: "8GB",
        },
        {
          value: "Standard_B4s_v2",
          label: "Standard_B4s_v2",
          cpu: "4",
          memory: "16GB",
        },
        {
          value: "Standard_B8ls_v2",
          label: "Standard_B8ls_v2",
          cpu: "8",
          memory: "16GB",
        },
        {
          value: "Standard_B8s_v2",
          label: "Standard_B8s_v2",
          cpu: "8",
          memory: "32GB",
        },
        {
          value: "Standard_B16ls_v2",
          label: "Standard_B16ls_v2",
          cpu: "16",
          memory: "32GB",
        },
        {
          value: "Standard_B16s_v2",
          label: "Standard_B16s_v2",
          cpu: "16",
          memory: "64GB",
        },
        {
          value: "Standard_B32ls_v2",
          label: "Standard_B32ls_v2",
          cpu: "32",
          memory: "64GB",
        },
        {
          value: "Standard_B32s_v2",
          label: "Standard_B32s_v2",
          cpu: "32",
          memory: "128GB",
        },
      ],
    },
    {
      title: "Family D (Dsv6 sizes)",
      options: [
        {
          value: "Standard_D2s_v6",
          label: "Standard_D2s_v6",
          cpu: "2",
          memory: "8GB",
        },
        {
          value: "Standard_D4s_v6",
          label: "Standard_D4s_v6",
          cpu: "4",
          memory: "16GB",
        },
        {
          value: "Standard_D8s_v6",
          label: "Standard_D8s_v6",
          cpu: "8",
          memory: "32GB",
        },
        {
          value: "Standard_D16s_v6",
          label: "Standard_D16s_v6",
          cpu: "16",
          memory: "64GB",
        },
        {
          value: "Standard_D32s_v6",
          label: "Standard_D32s_v6",
          cpu: "32",
          memory: "128GB",
        },
        {
          value: "Standard_D48s_v6",
          label: "Standard_D48s_v6",
          cpu: "48",
          memory: "192GB",
        },
        {
          value: "Standard_D64s_v6",
          label: "Standard_D64s_v6",
          cpu: "64",
          memory: "256GB",
        },
        {
          value: "Standard_D96s_v6",
          label: "Standard_D96s_v6",
          cpu: "96",
          memory: "384GB",
        },
        {
          value: "Standard_D128s_v6",
          label: "Standard_D128s_v6",
          cpu: "128",
          memory: "512GB",
        },
      ],
    },
  ];

  const [usernameWarning, setUsernameWarning] = useState("");
  const [passwordWarning, setPasswordWarning] = useState("");

  const disallowedUsernames = [
    "administrator",
    "admin",
    "user",
    "user1",
    "test",
    "user2",
    "test1",
    "user3",
    "admin1",
    "1",
    "123",
    "a",
    "actuser",
    "adm",
    "admin2",
    "aspnet",
    "backup",
    "console",
    "david",
    "guest",
    "john",
    "owner",
    "root",
    "server",
    "sql",
    "support",
    "support_388945a0",
    "sys",
    "test2",
    "test3",
    "user4",
    "user5",
  ];

  const disallowedPasswords = [
    "abc@123",
    "P@$$w0rd",
    "P@ssw0rd",
    "P@ssword123",
    "Pa$$word",
    "pass@word1",
    "Password!",
    "Password1",
    "Password22",
    "iloveyou!",
  ];

  const validateUsername = (username) => {
    if (username.length < 1) return "Username must be at least 1 character.";
    if (username.length > 64) return "Username cannot exceed 64 characters.";
    if (disallowedUsernames.includes(username.toLowerCase()))
      return "This username is not allowed.";
    if (username.endsWith("."))
      return "Windows username cannot end with a dot.";
    return "";
  };

  const validatePassword = (password) => {
    const lower = /[a-z]/;
    const upper = /[A-Z]/;
    const digit = /\d/;
    const special = /[\W_]/;

    let complexityCount = 0;
    if (lower.test(password)) complexityCount++;
    if (upper.test(password)) complexityCount++;
    if (digit.test(password)) complexityCount++;
    if (special.test(password)) complexityCount++;

    if (password.length < 6) return "Password must be at least 6 characters.";
    if (password.length > 72) return "Password cannot exceed 72 characters.";
    if (disallowedPasswords.includes(password))
      return "This password is not allowed.";
    if (complexityCount < 3) {
      return "Password must have at least 3 of: Uppercase, Lowercase, Digit, Special Character";
    }
    return "";
  };

  const handleUsernameChange = (e) => {
    const username = e.target.value;
    setAdminUser(username);
    const warning = validateUsername(username);
    setUsernameWarning(warning);
  };

  const handlePasswordChange = (e) => {
    const password = e.target.value;
    setAdminPassword(password);
    const warning = validatePassword(password);
    setPasswordWarning(warning);
  };

  const handleSave = async () => {
    setAlert("");

    // Ensure all required fields are filled
    if (
      !resourceName ||
      !adminUser ||
      !adminPassword ||
      !allocation ||
      !vmSize ||
      !userID ||
      !projectID
    ) {
      setAlert("Please fill out all required fields");
      return;
    }

    try {
      const res = await fetch("/api/resource", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
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
        }),
      });

      const data = await res.json();
      console.log(data);

      if (!res.ok) {
        throw new Error(data.message || `Failed to save: ${res.statusText}`);
      }

      router.push("/requestresource");
    } catch (error) {
      setAlert(error.message || "An error occurred while saving the resource.");
      console.error("Error while saving resource:", error);
    }
  };

  const filterVMSize = async () => {
    // console.log(projectData);
    try {
      const res = await fetch("/api/policy", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch policy: ${res.statusText}`);
      }

      const responseData = await res.json();
      const { data } = responseData;

      const {
        memory,
        memoryMes,
        hdd,
        hddMes,
        ssd,
        ssdMes,
        cpu,
        cpuMes,
        netBand,
        netBandMes,
        env,
        envMes,
        apelMes,
        noteMes,
      } = data;

      const availableVM = vmSizeOptions.flatMap((family) =>
        family.options.filter((size) => {
          const policyMemory = parseInt(memory.replace(/\D/g, ""), 10);
          const policyCPU = parseInt(cpu.replace(/\D/g, ""), 10);
          const vmMemoryProvide = parseInt(size.memory.replace(/\D/g, ""), 10);

          return (
            Number(size.cpu) <= policyCPU && policyMemory <= vmMemoryProvide
          );
        })
      );

      setAvailableVM(availableVM);
      setVMSize(availableVM[0].value);
    } catch (error) {
      console.log("Error while filtering VM size:", error);
    }
  };

  useEffect(() => {
    console.log("Project Data:", projectData.pathWithNamespace);
    console.log("Project Data:", projectData);
    const fetchProject = async () => {
      try {
        const res = await fetch(
          `/api/project?pathWithNamespace=${projectData.pathWithNamespace}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!res.ok) {
          throw new Error(`Failed to fetch project: ${res.statusText}`);
        }

        const result = await res.json();
        console.log("Fetched projects:", result);

        const [project] = result; // Destructure the first object in the array

        // Destructure the properties
        const {
          _id: projectId,
          projectName,
          projectDescription,
          pathWithNamespace,
          branch,
          rootPath,
          userId,
          createdAt,
          updatedAt,
        } = project;

        // console.log("Project ID:", projectId);
        // console.log("Project Name:", projectName);
        // console.log("Path with Namespace:", pathWithNamespace);
        // Handle the API response
        if (Array.isArray(result) && result.length > 0) {
          setProjectID(projectId);
          setUserID(userId);
        } else if (result && result.projectId) {
          // Handle case where response is an object
          setProjectID(projectId);
          setUserID(userId);
        } else {
          console.error("Unexpected API response structure:", result);
          setProjectID(""); // Reset projectID if no data is found
          setUserID(""); // Reset userID if no data is found
        }
      } catch (error) {
        console.error("Error fetching project:", error);
        setProjectID(""); // Reset projectID on error
        setUserID(""); // Reset userID on error
      }
    };

    fetchProject();
    filterVMSize();
  });
  return (
    <div className="min-h-screen text-white">
      {/* Header */}
      <div className="mx-16 my-6">
        <h1 className="text-4xl font-bold">Create Cloud Resource</h1>
        <h2 className="text-lg text-gray-400 ml-1 mt-4">
          Create Cloud Resource → {projectData.projectName}
        </h2>
      </div>
      {alert && (
        <div className="bg-red-500 w-fit text-sm text-white py-1 px-3 rounded-md ml-16">
          {alert}
        </div>
      )}
      {/* Form Container */}
      <div className="bg-white text-black mx-16 my-8 p-8 rounded-lg shadow-lg">
        {/* Section Title */}
        <h2 className="text-2xl font-semibold mb-6">Required Details</h2>

        {/* Form Fields */}
        <div className="grid grid-cols-2 gap-8">
          {/* Cloud Provider */}
          <div>
            <label htmlFor="cloudProvider" className="font-medium block mb-2">
              Cloud Provider
            </label>
            <div className="flex items-center space-x-2 ml-2">
              <Image src={Azure} width={84} height={"auto"} alt="Azure Logo" />
            </div>
          </div>

          {/* Resource Type */}
          <div>
            <label htmlFor="resourceType" className="font-medium block mb-2">
              Resource Type
            </label>
            <select
              id="resourceType"
              name="resourceType"
              className="border border-slate-300 rounded w-full px-4 py-2 text-base"
              defaultValue="Virtual Machine"
            >
              <option value="Virtual Machine">Virtual Machine</option>
              {/* <option value="Storage">Storage</option>
              <option value="Database">Database</option> */}
            </select>
          </div>

          {/* Name */}
          <div>
            <label htmlFor="name" className="font-medium block mb-2">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              className="border border-slate-300 rounded w-full px-4 py-2 text-base"
              placeholder="Enter virtual machine name"
              onChange={(e) => setResourceName(e.target.value)}
            />
          </div>

          {/* Resource Group
          <div>
            <label htmlFor="resourceGroup" className="font-medium block mb-2">
              Resource Group
            </label>
            <select
              id="resourceGroup"
              name="resourceGroup"
              className="border border-slate-300 rounded w-full px-4 py-2 text-base"
            >
              <option value="">Select resource group</option>
              <option value="Group1">Group1</option>
              <option value="Group2">Group2</option>
            </select>
          </div> */}

          {/* Region */}
          <div>
            <label htmlFor="region" className="font-medium block mb-2">
              Region
            </label>
            <div className="relative border border-slate-300 rounded w-full px-4 py-2 text-base">
              <select
                id="region"
                name="region"
                className="w-full focus:outline-none"
                defaultValue="East Asia"
                onChange={(e) => setRegion(e.target.value)}
              >
                <option value="" disabled>
                  Select a region
                </option>
                {regions.map((section, index) => (
                  <optgroup key={index} label={section.title}>
                    {section.options.map((option) => (
                      <option
                        key={option.value}
                        value={option.value}
                        className={option.className || ""}
                      >
                        {option.label}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
          </div>

          {/* VM Size */}
          <div>
            <label htmlFor="vmSize" className="font-medium block mb-2">
              VM Size{" "}
              <Link href={"/vmexplanation"}>
                <span className="font-light font-xs ml-2 text-blue-600">
                  Difference between the A, B, and D families
                </span>
              </Link>
            </label>
            <select
              id="vmSize"
              name="vmSize"
              className="border border-slate-300 rounded w-full px-4 py-2 text-base"
              onChange={(e) => setVMSize(e.target.value)}
            >
              <option value="" disabled>
                Select a VM Size
              </option>
              {availableVM.map((option, index) => (
                <option key={index} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Operating System */}
          <div>
            <label htmlFor="os" className="font-medium block mb-2">
              Operating System
            </label>
            <select
              id="os"
              name="os"
              className="border border-slate-300 rounded w-full px-4 py-2 text-base"
              defaultValue="Ubuntu"
              onChange={(e) => setOS(e.target.value)}
            >
              <option value="Ubuntu">Ubuntu</option>
            </select>
          </div>

          {/* Admin Username */}
          <div>
            <label htmlFor="adminUsername" className="font-medium block mb-2">
              Admin Username
            </label>
            <input
              type="text"
              id="adminUsername"
              name="adminUsername"
              className="border border-slate-300 rounded w-full px-4 py-2 text-base"
              placeholder="Enter username"
              onChange={handleUsernameChange}
            />
            {usernameWarning && (
              <span className="text-red-500 text-sm mt-2 block">
                {usernameWarning}
              </span>
            )}
          </div>

          {/* Admin Password */}
          <div className="mt-4">
            <label htmlFor="adminPassword" className="font-medium block mb-2">
              Admin Password
            </label>
            <input
              type="password"
              id="adminPassword"
              name="adminPassword"
              className="border border-slate-300 rounded w-full px-4 py-2 text-base"
              placeholder="Enter password"
              onChange={handlePasswordChange}
            />
            {passwordWarning && (
              <span className="text-red-500 text-sm mt-2 block">
                {passwordWarning}
              </span>
            )}
          </div>

          {/* Network Interface
          <div>
            <label htmlFor="nic" className="font-medium block mb-2">
              Network Interface (NIC)
            </label>
            <input
              type="text"
              id="nic"
              name="nic"
              className="border border-slate-300 rounded w-full px-4 py-2 text-base"
              placeholder="Enter NIC name"
            />
          </div> */}

          {/* Private IP Allocation */}
          <div>
            <label htmlFor="ipAllocation" className="font-medium block mb-2">
              Private IP Allocation
            </label>
            <select
              id="ipAllocation"
              name="ipAllocation"
              className="border border-slate-300 rounded w-full px-4 py-2 text-base"
              onChange={(e) => setAllocation(e.target.value)}
            >
              <option value="">Select private IP allocation</option>
              <option value="Dynamic">Dynamic</option>
              <option value="Static">Static</option>
            </select>
          </div>
        </div>

        {/* Optional Details
        <div className="mt-6">
          <button className="text-blue-500 underline">Optional Details</button>
        </div> */}

        {/* Buttons */}
        <div className="flex justify-between items-center mt-8">
          <button
            className="bg-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-400"
            onClick={() => router.back()}
          >
            Cancel
          </button>
          <button
            className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600"
            onClick={handleSave}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
