"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import { Card, Typography } from "@material-tailwind/react";

export default function Projectlist() {
  const { userId } = useAuth();
  const { user } = useUser();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // Fetch project data from the API
    const fetchProject = async () => {
      try {
        const res = await fetch(`/api/project?userId=${userId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const projectResult = await res.json();
        console.log("Fetched projects:", projectResult);

        if (projectResult.length === 0) {
          console.log("No projects found");
          return;
        }

        let filteredProjects = [];

        for (const project of projectResult) {
          const projectId = project._id;

          try {
            const res1 = await fetch(`/api/request?projectid=${projectId}`, {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
            });

            const requestResult = await res1.json();
            console.log(
              `Requests for project ${project.projectName}:`,
              requestResult
            );

            if (requestResult.length > 0) {
              filteredProjects.push(project); // Keep project if it has requests
            } else {
              // Delete Project and its resources if no request found
              try {
                const deleteProject = await fetch(
                  `/api/project?projectId=${projectId}`,
                  {
                    method: "DELETE",
                    headers: {
                      "Content-Type": "application/json",
                    },
                  }
                );

                const deleteResource = await fetch(
                  `/api/resource?requestId=${projectId}`,
                  {
                    method: "DELETE",
                    headers: {
                      "Content-Type": "application/json",
                    },
                  }
                );

                if (deleteProject.ok && deleteResource.ok) {
                  console.log(`Deleted project: ${project.projectName}`);
                }
              } catch (deleteError) {
                console.error(
                  `Error deleting project ${project.projectName}:`,
                  deleteError
                );
              }
            }
          } catch (requestError) {
            console.error(
              `Error fetching requests for project ${project.projectName}:`,
              requestError
            );
          }
        }

        setProjects(filteredProjects); // ✅ Only set remaining projects
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [userId]);

  // For search
  const filteredProjects = Array.isArray(projects)
    ? projects.filter((project) =>
        project.projectName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <div>
      {/* Welcome Message */}
      <p className="mx-16 my-5 text-balance text-center text-5xl font-bold text-white">
        Welcome Back, {user ? user.firstName : "User"}!
      </p>

      {/* Header with Projects Title and New Project Button */}
      <div className="mx-16 my-5 flex items-center justify-between gap-x-16">
        <div className="flex items-center gap-x-8">
          <h1 className="text-balance text-4xl font-bold text-white">
            Projects
          </h1>
          <Link
            type="button"
            className="inline-flex flex-none items-center rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            href={"/create-project"}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="-ml-0.5 mr-1.5 h-5 w-5 text-gray-500"
              aria-hidden="true"
              data-slot="icon"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
            New Project
          </Link>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search projects..."
            className="rounded-full bg-white px-6 py-2 text-gray-800 placeholder-gray-400"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <svg
            className="absolute right-3 top-2.5 h-5 w-5 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
            />
          </svg>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-red-500">{error}</p>
        </div>
      ) : (
        /* Project Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-8 py-6">
          {filteredProjects.length > 0 ? (
            filteredProjects.map((project) => (
              <Card
                key={project._id}
                className="hover:shadow-lg transition-shadow duration-300"
              >
                <div className="rounded-lg bg-white border p-6 shadow-md">
                  <h2 className="text-xl font-bold text-gray-900">
                    {project.projectName}
                  </h2>
                  <div className="mt-4 space-y-2">
                    <p className="text-sm text-gray-500">
                      <strong>Description:</strong> {project.projectDescription}
                    </p>
                    <p className="text-sm text-gray-500">
                      <strong>Root Path:</strong>{" "}
                      <a
                        href={project.rootPath}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        {project.rootPath}
                      </a>
                    </p>
                    <p className="text-sm text-gray-500">
                      <strong>Created At:</strong>{" "}
                      {new Date(project.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-500">
                      <strong>Updated At:</strong>{" "}
                      {new Date(project.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Link
                    href={{
                      pathname: `/project`,
                      query: { projectId: project._id },
                    }}
                    className="mt-4 inline-block rounded-md bg-blue-500 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600"
                    aria-label="View project details"
                  >
                    View Project
                  </Link>
                </div>
              </Card>
            ))
          ) : (
            <div className="col-span-2 flex items-center justify-center h-64">
              <p className="text-white-600">No Projects Found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
