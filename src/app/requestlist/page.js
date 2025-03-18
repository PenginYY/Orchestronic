"use client";

import React, { useEffect, useState } from "react";
import unfilter from "../../../public/filter-circle.svg";
import filter from "../../../public/filter-circle-fill.svg";
import Image from "next/image";
import Link from "next/link";
import { redirect, useRouter } from "next/navigation";
import { Typography } from "@material-tailwind/react";
import { useUser } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";

export default function RequestList() {
  const { user } = useUser();
  const userRole = user?.publicMetadata?.role;
  if (userRole !== "pm" && userRole !== "ops") {
    redirect("/"); // Or you can return a message like "Access Denied"
  }
  const router = useRouter();
  const TABLE_HEAD_REQ = [
    "Project Name",
    "Describe",
    "Type",
    "Status PM",
    "Status Ops",
  ];
  const [TABLE_ROWS_REQ, setTableRowsReq] = useState([]);
  const [sortAsc, setSortAsc] = useState(true);
  const [sortKey, setSortKey] = useState("statuspm");

  useEffect(() => {
    // Fetch request data from the API
    const fetchRequests = async () => {
      try {
        const resProjects = await fetch("/api/project", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const resRequesttype = await fetch("/api/requesttype", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (resProjects.ok && resRequesttype.ok) {
          const ProjectData = await resProjects.json();
          const RequesttypeData = await resRequesttype.json();

          const projectStatusMap = {};
          RequesttypeData.forEach((requesttype) => {
            projectStatusMap[requesttype.projectid] = requesttype.status;
          });

          const rows = ProjectData.map((element) => {
            // Check if the project should be shown based on the role
            if (userRole === "ops" && element.statuspm === "Approved") {
              return {
                projectid: element._id,
                projectname: element.projectName,
                describe: element.projectDescription,
                type: projectStatusMap[element._id],
                statuspm: element.statuspm,
                statusops: element.statusops,
              };
            } else if (userRole === "pm") {
              return {
                projectid: element._id,
                projectname: element.projectName,
                describe: element.projectDescription,
                type: projectStatusMap[element._id],
                statuspm: element.statuspm, // Show status for PM role as well
                statusops: element.statusops,
              };
            }
            // Return null or skip the element if it doesn't meet any role-specific criteria
            return null;
          }).filter((row) => row !== null); // Remove any null entries from the rows

          setTableRowsReq(rows);
        }
      } catch (error) {
        console.log("Failed to send request:", error.message);
      }
    };
    fetchRequests();
  }, []);

  const statusSortOrder = ["Request", "Under Review", "Rejected", "Approved"];
  const typeSortOrder = ["create", "destroy"];

  // Sorting function
  const sortRows = (rows, key, asc) => {
    return [...rows].sort((a, b) => {
      let valA = a[key];
      let valB = b[key];

      if (key === "statuspm" || key === "statusops") {
        valA = statusSortOrder.indexOf(valA);
        valB = statusSortOrder.indexOf(valB);
      } else if (key === "type") {
        valA = typeSortOrder.indexOf(valA);
        valB = typeSortOrder.indexOf(valB);
      }
      return asc ? valA - valB : valB - valA;
    });
  };

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  const sortedRows = sortRows(TABLE_ROWS_REQ, sortKey, sortAsc);

  return (
    <div>
      <p className="text-5xl font-bold mx-16 my-5">Requests</p>

      {/* Details box */}
      <div className="overflow-hidden bg-white mx-16 my-8 text-black text-x1 font-normal rounded-lg">
        <table className="table-fixed w-full">
          <thead>
            <tr>
              {TABLE_HEAD_REQ.map((head, index) => {
                const sortColumn =
                  head === "Type"
                    ? "type"
                    : head === "Status PM"
                    ? "statuspm"
                    : head === "Status Ops"
                    ? "statusops"
                    : null;
                return (
                  <th
                    key={index}
                    className="border-b border-blue-gray-100 bg-gray-100 p-4 text-black font-semibold"
                    onClick={
                      sortColumn ? () => handleSort(sortColumn) : undefined
                    }
                  >
                    <Typography
                      variant="small"
                      className="font-medium text-sm leading-none opacity-70 flex flex-row items-center"
                    >
                      {sortColumn && (
                        <span className="mr-2">
                          <Image
                            src={
                              sortKey === sortColumn && sortAsc
                                ? filter
                                : unfilter
                            }
                            alt="filter"
                            height="20"
                            width="20"
                          />
                        </span>
                      )}
                      {head}
                    </Typography>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {userRole === "pm" &&
              sortedRows.map(
                (
                  {
                    projectid,
                    projectname,
                    describe,
                    type,
                    statuspm,
                    statusops,
                  },
                  index
                ) => {
                  const isOdd = index % 2 === 1;
                  const rowBgColor = isOdd ? "bg-gray-50" : "bg-white";

                  return (
                    <tr
                      key={projectid}
                      className={`${rowBgColor} cursor-pointer`}
                    >
                      <td className="p-4 border-b border-blue-gray-50">
                        <Link
                          href={{
                            pathname: "/projectpm",
                            query: { projectid },
                          }}
                        >
                          <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal"
                          >
                            {projectname}
                          </Typography>
                        </Link>
                      </td>
                      <td className="p-4 border-b border-blue-gray-50">
                        <Link
                          href={{
                            pathname: "/projectpm",
                            query: { projectid },
                          }}
                        >
                          <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal"
                          >
                            {describe}
                          </Typography>
                        </Link>
                      </td>
                      <td className="p-4 border-b border-blue-gray-50">
                        <Link
                          href={{
                            pathname: "/projectpm",
                            query: { projectid },
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
                      <td className="p-4 border-b border-blue-gray-50">
                        <Link
                          href={{
                            pathname: "/projectpm",
                            query: { projectid },
                          }}
                        >
                          <Typography
                            variant="small"
                            className={`font-normal px-2 py-1 rounded-md 
                          ${
                            statuspm === "Approved"
                              ? "text-green-600 bg-green-100 px-2"
                              : statuspm === "Under Review"
                              ? "text-amber-600 bg-amber-100"
                              : statuspm === "Request"
                              ? "text-gray-600 bg-gray-100"
                              : "text-red-600 bg-red-100"
                          }`}
                          >
                            {statuspm}
                          </Typography>
                        </Link>
                      </td>
                      <td className="p-4 border-b border-blue-gray-50">
                        <Link
                          href={{
                            pathname: "/projectpm",
                            query: { projectid },
                          }}
                        >
                          <Typography
                            variant="small"
                            className={`font-normal px-2 py-1 rounded-md 
                          ${
                            statusops === "Approved"
                              ? "text-green-600 bg-green-100 px-2"
                              : statusops === "Under Review"
                              ? "text-amber-600 bg-amber-100"
                              : statusops === "Request"
                              ? "text-gray-600 bg-gray-100"
                              : "text-red-600 bg-red-100"
                          }`}
                          >
                            {statusops}
                          </Typography>
                        </Link>
                      </td>
                    </tr>
                  );
                }
              )}

            {userRole === "ops" &&
              sortedRows.map(
                (
                  {
                    projectid,
                    projectname,
                    describe,
                    type,
                    statuspm,
                    statusops,
                  },
                  index
                ) => {
                  const isOdd = index % 2 === 1;
                  const rowBgColor = isOdd ? "bg-gray-50" : "bg-white";

                  return (
                    <tr
                      key={projectid}
                      className={`${rowBgColor} cursor-pointer`}
                    >
                      <td className="p-4 border-b border-blue-gray-50">
                        <Link
                          href={{
                            pathname: "/projectops",
                            query: { projectid },
                          }}
                        >
                          <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal"
                          >
                            {projectname}
                          </Typography>
                        </Link>
                      </td>
                      <td className="p-4 border-b border-blue-gray-50">
                        <Link
                          href={{
                            pathname: "/projectops",
                            query: { projectid },
                          }}
                        >
                          <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal"
                          >
                            {describe}
                          </Typography>
                        </Link>
                      </td>
                      <td className="p-4 border-b border-blue-gray-50">
                        <Link
                          href={{
                            pathname: "/projectops",
                            query: { projectid },
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
                      <td className="p-4 border-b border-blue-gray-50">
                        <Link
                          href={{
                            pathname: "/projectops",
                            query: { projectid },
                          }}
                        >
                          <Typography
                            variant="small"
                            className={`font-normal px-2 py-1 rounded-md 
                          ${
                            statuspm === "Approved"
                              ? "text-green-600 bg-green-100 px-2"
                              : statuspm === "Under Review"
                              ? "text-amber-600 bg-amber-100"
                              : statuspm === "Request"
                              ? "text-gray-600 bg-gray-100"
                              : "text-red-600 bg-red-100"
                          }`}
                          >
                            {statuspm}
                          </Typography>
                        </Link>
                      </td>
                      <td className="p-4 border-b border-blue-gray-50">
                        <Link
                          href={{
                            pathname: "/projectops",
                            query: { projectid },
                          }}
                        >
                          <Typography
                            variant="small"
                            className={`font-normal px-2 py-1 rounded-md 
                          ${
                            statusops === "Approved"
                              ? "text-green-600 bg-green-100 px-2"
                              : statusops === "Under Review"
                              ? "text-amber-600 bg-amber-100"
                              : statusops === "Request"
                              ? "text-gray-600 bg-gray-100"
                              : "text-red-600 bg-red-100"
                          }`}
                          >
                            {statusops}
                          </Typography>
                        </Link>
                      </td>
                    </tr>
                  );
                }
              )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
