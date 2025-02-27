"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function PolicyEdit() {
  const router = useRouter();

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
          setMemory(result.data.memory);
          setHDD(result.data.hdd);
          setSSD(result.data.ssd);
          setCPU(result.data.cpu);
          setNetBand(result.data.netBand);
          setEnv(result.data.env);

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

  const handleEdit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/policy", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
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
        }),
      });

      if (res.ok) {
        router.push("/policy"); // Redirect to policy page if success
      } else {
        throw new Error("Failed to set policy");
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      <p className="text-5xl font-bold mx-16 my-5">Terms and Policies</p>

      {/* Details box */}
      <div className="bg-white mx-16 my-8 py-8 text-black text-x1 rounded font-normal">
        <form onSubmit={handleEdit}>
          {/* Subtitle */}
          <div className="flex flex-row justify-between items-center">
            <p className="text-3xl font-semibold ml-4">
              Resource Allocation Terms and Policies
            </p>
            <button
              type="submit"
              className="mr-4 py-2 px-10 text-sm text-black bg-[#E3E3E3] rounded"
            >
              Save
            </button>
          </div>

          {/* Policy details */}
          <div>
            {/* Memory (RAM) */}
            <div>
              <p className="text-xl font-medium ml-4 mt-5">Memory (RAM)</p>
              <div className="flex flex-row">
                <div className="flex flex-col mx-16 mt-2">
                  <label htmlFor="memory" className="text-lg font-normal">
                    Maximum
                  </label>
                  <label
                    htmlFor="memory-message"
                    className="mt-2 text-lg font-normal"
                  >
                    Message
                  </label>
                </div>
                <div className="flex flex-col mx-20 mt-2 w-full text-lg font-normal">
                  <select
                    id="memory"
                    value={memory}
                    onChange={(e) => setMemory(e.target.value)}
                    className="w-1/3 bg-gray-50 border"
                  >
                    <option value="" disabled>
                      Choose maximum memory (RAM)
                    </option>
                    <option value="2GB">2 GB</option>
                    <option value="4GB">4 GB</option>
                    <option value="8GB">8 GB</option>
                    <option value="16GB">16 GB</option>
                    <option value="18GB">18 GB</option>
                    <option value="20GB">20 GB</option>
                    <option value="32GB">32 GB</option>
                  </select>
                  <textarea
                    id="memory-message"
                    value={memoryMes}
                    onChange={(e) => setMemoryMes(e.target.value)}
                    rows="3"
                    className="mt-2 px-3 py-1 bg-gray-50 rounded-lg border"
                    placeholder="comment..."
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Storage - Hard Disk Drive (HDD) */}
            <div>
              <p className="text-xl font-medium ml-4 mt-5">
                Storage - Hard Disk Drive (HDD)
              </p>
              <div className="flex flex-row">
                <div className="flex flex-col mx-16 mt-2">
                  <label htmlFor="hdd" className="text-lg font-normal">
                    Maximum
                  </label>
                  <label
                    htmlFor="hdd-message"
                    className="mt-2 text-lg font-normal"
                  >
                    Message
                  </label>
                </div>
                <div className="flex flex-col mx-20 mt-2 w-full text-lg font-normal">
                  <select
                    id="hdd"
                    value={hdd}
                    onChange={(e) => setHDD(e.target.value)}
                    className="w-1/3 bg-gray-50 border"
                  >
                    <option value="" disabled>
                      Choose maximum HDD
                    </option>
                    <option value="500GB">500 GB</option>
                    <option value="1TB">1 TB</option>
                    <option value="2TB">2 TB</option>
                    <option value="4TB">4 TB</option>
                    <option value="8TB">8 TB</option>
                    <option value="16TB">16 TB</option>
                  </select>
                  <textarea
                    id="hdd-message"
                    value={hddMes}
                    onChange={(e) => setHDDMes(e.target.value)}
                    rows="3"
                    className="mt-2 px-3 py-1 bg-gray-50 rounded-lg border"
                    placeholder="Comment..."
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Storage - Solid State Drive (SSD) */}
            <div>
              <p className="text-xl font-medium ml-4 mt-5">
                Storage - Solid State Drive (SSD)
              </p>
              <div className="flex flex-row">
                <div className="flex flex-col mx-16 mt-2">
                  <label htmlFor="ssd" className="text-lg font-normal">
                    Storage
                  </label>
                  <label
                    htmlFor="ssd-message"
                    className="mt-2 text-lg font-normal"
                  >
                    Message
                  </label>
                </div>
                <div className="flex flex-col mx-20 mt-2 w-full text-lg font-normal">
                  <select
                    id="ssd"
                    value={ssd}
                    onChange={(e) => setSSD(e.target.value)}
                    className="w-1/3 bg-gray-50 border"
                  >
                    <option value="" disabled>
                      Choose maximum SSD
                    </option>
                    <option value="256GB">256 GB</option>
                    <option value="500GB">500 GB</option>
                    <option value="1TB">1 TB</option>
                    <option value="2TB">2 TB</option>
                    <option value="4TB">4 TB</option>
                    <option value="8TB">8 TB</option>
                  </select>
                  <textarea
                    id="ssd-message"
                    value={ssdMes}
                    onChange={(e) => setSSDMes(e.target.value)}
                    rows="3"
                    className="mt-2 px-3 py-1 bg-gray-50 rounded-lg border"
                    placeholder="Comment..."
                  ></textarea>
                </div>
              </div>
            </div>

            {/* CPU Cores */}
            <div>
              <p className="text-xl font-medium ml-4 mt-5">CPU Cores</p>
              <div className="flex flex-row">
                <div className="flex flex-col mx-16 mt-2">
                  <label htmlFor="cpu" className="text-lg font-normal">
                    Maximum
                  </label>
                  <label
                    htmlFor="cpu-message"
                    className="mt-2 text-lg font-normal"
                  >
                    Message
                  </label>
                </div>
                <div className="flex flex-col mx-20 mt-2 w-full text-lg font-normal">
                  <select
                    id="cpu"
                    value={cpu}
                    onChange={(e) => setCPU(e.target.value)}
                    className="w-1/3 bg-gray-50 border"
                  >
                    <option value="" disabled>
                      Choose maximum CPU Cors
                    </option>
                    <option value="2CPU">2 CPU</option>
                    <option value="4CPU">4 CPU</option>
                    <option value="8CPU">8 CPU</option>
                    <option value="16CPU">16 CPU</option>
                    <option value="32CPU">32 CPU</option>
                  </select>
                  <textarea
                    id="cpu-message"
                    value={cpuMes}
                    onChange={(e) => setCPUMes(e.target.value)}
                    rows="3"
                    className="mt-2 px-3 py-1 bg-gray-50 rounded-lg border"
                    placeholder="Comment..."
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Network Bandwidth */}
            <div>
              <p className="text-xl font-medium ml-4 mt-5">Network Bandwidth</p>
              <div className="flex flex-row">
                <div className="flex flex-col mx-16 mt-2">
                  <label htmlFor="netBand" className="text-lg font-normal">
                    Maximum
                  </label>
                  <label
                    htmlFor="netBand-message"
                    className="mt-2 text-lg font-normal"
                  >
                    Message
                  </label>
                </div>
                <div className="flex flex-col mx-20 mt-2 w-full text-lg font-normal">
                  <select
                    id="netBand"
                    value={netBand}
                    onChange={(e) => setNetBand(e.target.value)}
                    className="w-1/3 bg-gray-50 border"
                  >
                    <option value="" disabled>
                      Choose maximum network bandwidth
                    </option>
                    <option value="100Mbps">100 Mbps</option>
                    <option value="500Mbps">500 Mbps</option>
                    <option value="1Gbps">1 Gbps</option>
                    <option value="10Gbps">10 Gbps</option>
                  </select>
                  <textarea
                    id="netBand-message"
                    value={netBandMes}
                    onChange={(e) => setNetBandMes(e.target.value)}
                    rows="3"
                    className="mt-2 px-3 py-1 bg-gray-50 rounded-lg border"
                    placeholder="Comment..."
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Environment Limits */}
            <div>
              <p className="text-xl font-medium ml-4 mt-5">
                Environment Limits
              </p>
              <div className="flex flex-row">
                <div className="flex flex-col mx-16 mt-2">
                  <label htmlFor="env" className="text-lg font-normal">
                    Maximum
                  </label>
                  <label
                    htmlFor="env-message"
                    className="mt-2 text-lg font-normal"
                  >
                    Message
                  </label>
                </div>
                <div className="flex flex-col mx-20 mt-2 w-full text-lg font-normal">
                  <select
                    id="env"
                    value={env}
                    onChange={(e) => setEnv(e.target.value)}
                    className="w-1/3 bg-gray-50 border"
                  >
                    <option value="" disabled>
                      Choose environment limits
                    </option>
                    <option value="2env">2 environments</option>
                    <option value="5env">5 environments</option>
                    <option value="10env">10 environments</option>
                    <option value="20env">20 environments</option>
                  </select>
                  <textarea
                    id="env-message"
                    value={envMes}
                    onChange={(e) => setEnvMes(e.target.value)}
                    rows="3"
                    className="mt-2 px-3 py-1 bg-gray-50 rounded-lg border"
                    placeholder="Comment..."
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Approval Process for Exceeding Limits */}
            <div>
              <p className="text-xl font-medium ml-4 mt-5">
                Approval Process for Exceeding Limits
              </p>
              <div className="flex flex-row">
                <div className="flex flex-col mx-16 mt-2">
                  <label htmlFor="apel-message" className="text-lg font-normal">
                    Message
                  </label>
                </div>
                <div className="flex flex-col mx-20 mt-2 w-full text-lg font-normal">
                  <textarea
                    id="apel-message"
                    value={apelMes}
                    onChange={(e) => setApelMes(e.target.value)}
                    rows="3"
                    className="mt-2 px-3 py-1 bg-gray-50 rounded-lg border"
                    placeholder="Comment..."
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Note */}
            <div>
              <p className="text-xl font-medium ml-4 mt-5">Note</p>
              <div className="flex flex-row">
                <div className="flex flex-col mx-16 mt-2">
                  <label htmlFor="note-message" className="text-lg font-normal">
                    Message
                  </label>
                </div>
                <div className="flex flex-col mx-20 mt-2 w-full text-lg font-normal">
                  <textarea
                    id="note-message"
                    value={noteMes}
                    onChange={(e) => setNoteMes(e.target.value)}
                    rows="3"
                    className="mt-2 px-3 py-1 bg-gray-50 rounded-lg border"
                    placeholder="Comment..."
                  ></textarea>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

// const handleCreate = async (e) => {
//   e.preventDefault();

//   try {
//     const res = await fetch("http://localhost:3000/api/policy", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         memory,
//         memoryMes,
//         hdd,
//         hddMes,
//         ssd,
//         ssdMes,
//         cpu,
//         cpuMes,
//         netBand,
//         netBandMes,
//         env,
//         envMes,
//         apelMes,
//         noteMes,
//       }),
//     });

//     if (res.ok) {
//       router.push("/policy");
//     } else {
//       throw new Error("Failed to set policy");
//     }
//   } catch (error) {
//     console.log(error);
//   }
// };
