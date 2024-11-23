"use client";

import Link from "next/link";
import Navbar from "../components/navbar";
import React, { useEffect, useState } from "react";

export default function PolicyDetails() {
    // Memory (RAM)
    const [memoryMes, setMemoryMes] = useState("");

    // Storage - Hard Disk Drive (HDD)
    const [hddMes, setHDDMes] = useState("");

    // Storage - Solid State Drive (SSD)
    const [ssdMes, setSSDMes] = useState("");

    // CPU Cores
    const [cpuMes, setCPUMes] = useState("");

    // Network Bandwidth
    const [netBandMes, setNetBandMes] = useState("");

    // Environment Limits
    const [envMes, setEnvMes] = useState("");

    // Approval Process for Exceeding Limits
    const [apelMes, setApelMes] = useState("");

    // Note
    const [noteMes, setNoteMes] = useState("");

    useEffect(() => {
        // Fetch policy data from the API
        const fetchPolicy = async () => {
            try {
                const res = await fetch("/api/policy", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
                const result = await res.json();
                console.log("test");
                console.log(result.data.memoryMes);

                if (res.ok) {
                    // Update state with fetched data
                    setMemoryMes(result.data.memoryMes);
                    setHDDMes(result.data.hddMes);
                    setSSDMes(result.data.ssdMes);
                    setCPUMes(result.data.cpuMes);
                    setNetBandMes(result.data.netBandMes);
                    setEnvMes(result.data.envMes);
                    setApelMes(result.data.apelMes);
                    setNoteMes(result.data.noteMes);
                }
            } catch (error) {
                console.error("Error fetching policy:", error);
            }
        };
        fetchPolicy();
    }, []);

    return (
        <div>
            <Navbar />
            {/* Details box */}
            <div className="bg-white mx-16 my-8 py-8 text-black text-x1 font-normal rounded">

                {/* Subtitle */}
                <div className="flex flex-row justify-between items-center">
                    <div className="flex-grow flex justify-center">
                        <p className="text-3xl font-semibold ml-4">
                            Resource Allocation Terms and Policies
                        </p>
                    </div>
                    <Link className="mr-4 py-2 px-10 text-sm text-black bg-[#E3E3E3] rounded" href="/policyedit">
                        Edit
                    </Link>
                </div>

                {/* Policy details */}
                <div className="mx-4 my-8">
                    <p>
                        To ensure efficient use of infrastructure and prevent resource over-allocation, all resource requests through the Internal Developer Platform (IDP) must comply with the following limits
                    </p>
                    <ol className="list-decimal mt-5 ml-4">
                        <li className="font-semibold">Memory</li>
                        <ul className="list-disc ml-6">
                            {memoryMes && memoryMes.split('\n').map((line, index) => (
                                <li key={index}>{line}</li>
                            ))}
                        </ul>

                        <li className="font-semibold">Storage - Hard Disk Drive (HDD)</li>
                        <ul className="list-disc ml-6">
                            {hddMes && hddMes.split('\n').map((line, index) => (
                                <li key={index}>{line}</li>
                            ))}
                        </ul>

                        <li className="font-semibold">Storage - Solid State Drive (SSD)</li>
                        <ul className="list-disc ml-6">
                            {ssdMes && ssdMes.split('\n').map((line, index) => (
                                <li key={index}>{line}</li>
                            ))}
                        </ul>

                        <li className="font-semibold">CPU Cores</li>
                        <ul className="list-disc ml-6">
                            {cpuMes && cpuMes.split('\n').map((line, index) => (
                                <li key={index}>{line}</li>
                            ))}
                        </ul>

                        <li className="font-semibold">Network Bandwidth</li>
                        <ul className="list-disc ml-6">
                            {netBandMes && netBandMes.split('\n').map((line, index) => (
                                <li key={index}>{line}</li>
                            ))}
                        </ul>

                        <li className="font-semibold">Environment Limits</li>
                        <ul className="list-disc ml-6">
                            {envMes && envMes.split('\n').map((line, index) => (
                                <li key={index}>{line}</li>
                            ))}
                        </ul>

                        <li className="font-semibold">Approval Process for Exceeding Limits</li>
                        <ul className="list-disc ml-6">
                            {apelMes && apelMes.split('\n').map((line, index) => (
                                <li key={index}>{line}</li>
                            ))}
                        </ul>

                    </ol>
                    <p className="font-semibold mt-5">Note: {noteMes}</p>
                </div>
            </div>
        </div>
    );
}