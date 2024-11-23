"use client"

import Navbar from "../components/navbar";
import React, { useState } from "react";
import Router from "next/navigation";
import { Typography } from "@material-tailwind/react";
import unfilter from "../../../public/filter-circle.svg";
import filter from "../../../public/filter-circle-fill.svg";
import Image from "next/image";

export default function RequestList() {
    const TABLE_HEAD_REQ = ["ID", "Title", "Describe", "Last Update", "Status"];

    const TABLE_ROWS_REQ = [
        { id: "00001", title: "Project Title", describe: "Describe", lastUpdate: "27/5/24", status: "Request" },
        { id: "00002", title: "Project Title", describe: "Describe", lastUpdate: "27/5/24", status: "Under Review" },
        { id: "00003", title: "Project Title", describe: "Describe", lastUpdate: "27/5/24", status: "Approved" },
        { id: "00004", title: "Project Title", describe: "Describe", lastUpdate: "27/5/24", status: "Rejected" },
        { id: "00005", title: "Project Title", describe: "Describe", lastUpdate: "27/5/24", status: "Request" },
        { id: "00006", title: "Project Title", describe: "Describe", lastUpdate: "27/5/24", status: "Request" },
    ];

    // Custom orders for sorting
    const order1 = ["Request", "Under Review", "Rejected", "Approved"];
    const order2 = ["Approved", "Rejected", "Under Review", "Request"];

    const [sortAsc, setSortAsc] = useState(true);

    const toggleSortOrder = () => {
        setSortAsc((prev) => !prev);
    };

    const sortedRows = [...TABLE_ROWS_REQ].sort((a, b) => {
        const currentOrder = sortAsc ? order1 : order2;
        return currentOrder.indexOf(a.status) - currentOrder.indexOf(b.status);
    });

    return (
        <div>
            <Navbar />
            <p className="text-5xl font-bold mx-16 my-5">Requests</p>

            {/* Details box */}
            <div className="overflow-hidden bg-white mx-16 my-8 text-black text-x1 font-normal rounded-lg h-dvh">
                <table className="table-fixed w-full">
                    <thead>
                        <tr>
                            {TABLE_HEAD_REQ.map((head) => (
                                <th
                                    key={head}
                                    className="border-b border-blue-gray-100 bg-gray-100 p-4 text-black font-semibold"
                                >
                                    <Typography
                                        variant="small"
                                        className="font-medium text-sm leading-none opacity-70 flex flex-row items-center"
                                        onClick={
                                            head === "Status" ? toggleSortOrder : undefined
                                        }
                                    >
                                        {head === "Status" && (
                                            <span className="mr-2">
                                                <Image
                                                    src={sortAsc ? filter : unfilter}
                                                    alt="filter"
                                                    height="20"
                                                    width="20"
                                                />
                                            </span>
                                        )}
                                        {head}
                                    </Typography>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {sortedRows.map(({ id, title, describe, lastUpdate, status }, index) => {
                            const isOdd = index % 2 === 1;
                            const rowBgColor = isOdd ? "bg-gray-50" : "bg-white";
                            return (
                                <tr key={id} className={`${rowBgColor}`}>

                                    <td className="p-4 border-b border-blue-gray-50">
                                        <Typography variant="small" color="blue-gray" className="font-normal">
                                            {id}
                                        </Typography>
                                    </td>
                                    <td className="p-4 border-b border-blue-gray-50">
                                        <Typography variant="small" color="blue-gray" className="font-normal">
                                            {title}
                                        </Typography>
                                    </td>
                                    <td className="p-4 border-b border-blue-gray-50">
                                        <Typography variant="small" color="blue-gray" className="font-normal">
                                            {describe}
                                        </Typography>
                                    </td>
                                    <td className="p-4 border-b border-blue-gray-50">
                                        <Typography variant="small" color="blue-gray" className="font-normal">
                                            {lastUpdate}
                                        </Typography>
                                    </td>
                                    <td className="p-4 border-b border-blue-gray-50">
                                        <Typography variant="small" className={`font-normal px-2 py-1 rounded-md 
                                                ${status === "Approved" ? "text-green-600 bg-green-100 px-2"
                                                : status === "Under Review" ? "text-amber-600 bg-amber-100"
                                                : status === "Request" ? "text-gray-600 bg-gray-100"
                                                    : "text-red-600 bg-red-100"
                                            }`}
                                        >
                                            {status}
                                        </Typography>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

        </div>
    );
}