"use client";

import Link from "next/link";
import Navbar from "../components/navbar";
import React, { useEffect, useState } from "react";

export default function PolicyDetails() {
    // Memory (RAM)
    const [memory, setMemory] = useState("");
    const [memoryMes, setMemoryMes] = useState("");

    // Storage - Hard Disk Drive (HDD)
    const [hdd, setHDD] = useState("");
    const [hddMes, setHDDMes] = useState("");

    // Storage - Solid State Drive (SSD)
    const [ssd, setSSD] = useState("");
    const [ssdMes, setSSDMes] = useState("");

    // CPU Cores
    const [cpu, setCPU] = useState("");
    const [cpuMes, setCPUMes] = useState("");

    // Network Bandwidth
    const [netBand, setNetBand] = useState("");
    const [netBandMes, setNetBandMes] = useState("");

    // Environment Limits
    const [env, setEnv] = useState("");
    const [envMes, setEnvMes] = useState("");

    // Approval Process for Exceeding Limits
    const [apelMes, setApelMes] = useState("");

    // Note
    const [noteMes, setNoteMes] = useState("");

    useEffect(() => {
        // Fetch policy data from the API
        const fetchPolicy = async () => {
            try {
                const res = await fetch("/api/policy");

                const data = await res.json();

                // Update state with fetched data
                setMemory(data.memory || "");
                setMemoryMes(data.memoryMes || "");
                setHDD(data.hdd || "");
                setHDDMes(data.hddMes || "");
                setSSD(data.ssd || "");
                setSSDMes(data.ssdMes || "");
                setCPU(data.cpu || "");
                setCPUMes(data.cpuMes || "");
                setNetBand(data.netBand || "");
                setNetBandMes(data.netBandMes || "");
                setEnv(data.env || "");
                setEnvMes(data.envMes || "");
                setApelMes(data.apelMes || "");
                setNoteMes(data.noteMes || "");
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
            <div className="bg-white mx-16 my-8 py-8 text-black text-x1 font-normal rounded h-dvh">

                {/* Subtitle */}
                <div className="flex flex-row justify-between items-center">
                    <p className="text-3xl font-semibold ml-4">
                        Resource Allocation Terms and Policies
                    </p>
                    <Link className="mr-4 py-2 px-10 text-sm text-black bg-[#E3E3E3] rounded" href="/policyedit">
                        Edit
                    </Link>
                </div>

                {/* Policy details */}
                <div className="mx-4 my-8">
                    <p>
                        To ensure efficient use of infrastructure and prevent resource over-allocation, all resource requests through the Internal Developer Platform (IDP) must comply with the following limits
                    </p>
                    <ol className="list-decimal">
                        <li>Memory</li>
                        <li>Storage - Hard Disk Drive (HDD)</li>
                        <li>Storage - Solid State Drive (SSD)</li>
                        <li>CPU Cores</li>
                        <li>Network Bandwidth</li>
                        <li>Environment Limits</li>
                        <li>Approval Process for Exceeding Limits</li>
                        <li></li>
                        <li></li>
                    </ol>
                    <p className="mt-5">Memory: {memory}</p>
                    <p className="mt-5">Memory Message: {memoryMes}</p>
                    <p>HDD: {hdd}</p>
                    <p>HDD Message: {hddMes}</p>
                    <p>SSD: {ssd}</p>
                    <p>SSD Message: {ssdMes}</p>
                    <p>CPU: {cpu}</p>
                    <p>CPU Message: {cpuMes}</p>
                    <p>Network Bandwidth: {netBand}</p>
                    <p>Network Bandwidth Message: {netBandMes}</p>
                    <p>Environment Limits: {env}</p>
                    <p>Environment Message: {envMes}</p>
                    <p>Approval Process Message: {apelMes}</p>
                    <p>Note: {noteMes}</p>
                </div>
            </div>
        </div>
    );
}