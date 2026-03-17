"use client";

export default function DashboardPage() {
    // Fake data demo
    const stats = [
        { title: "Users", value: 1200, color: "bg-primary-500" },
        { title: "Admins", value: 25, color: "bg-success-500" },
        { title: "Sales", value: "$15k", color: "bg-warning-500" },
        { title: "Errors", value: 5, color: "bg-danger-500" },
    ];

    const users = [
        { name: "Alice", email: "alice@example.com", role: "user" },
        { name: "Bob", email: "bob@example.com", role: "admin" },
        { name: "Charlie", email: "charlie@example.com", role: "user" },
    ];

    return (
        <div className="flex min-h-screen">

            <div className="flex-1 flex flex-col">

                <main className="p-8 bg-black flex-1 min-h-screen">
                    <div className="max-w-7xl mx-auto">
                        {/* Header */}
                        <div className="mb-8 border-b border-[#1e2126] pb-4">
                            <h1 className="text-3xl font-oswald font-black text-white mb-2 uppercase tracking-widest">
                                Dashboard Overview
                            </h1>
                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                                Quick summary of system statistics and users.
                            </p>
                        </div>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            {stats.map((stat) => (
                                <div
                                    key={stat.title}
                                    className={`p-6 rounded-sm border border-[#1e2126] bg-[#151515] relative overflow-hidden group hover:border-[#f5d800]/50 transition-colors`}
                                >
                                    <div className={`absolute top-0 left-0 w-1 h-full ${stat.color} opacity-50 group-hover:opacity-100 transition-opacity`} />
                                    <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">{stat.title}</h3>
                                    <p className="text-3xl font-oswald font-black text-white tracking-wider">{stat.value}</p>
                                </div>
                            ))}
                        </div>

                        {/* Users Table */}
                        <div className="bg-[#151515] rounded-sm border border-[#1e2126] overflow-x-auto">
                            <table className="min-w-full text-left border-collapse">
                                <thead className="bg-black border-b border-[#1e2126]">
                                    <tr>
                                        <th className="p-4 text-[10px] uppercase font-black tracking-widest text-gray-500">Name</th>
                                        <th className="p-4 text-[10px] uppercase font-black tracking-widest text-gray-500">Email</th>
                                        <th className="p-4 text-[10px] uppercase font-black tracking-widest text-gray-500">Role</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#1e2126]">
                                    {users.map((user, idx) => (
                                        <tr key={idx} className="hover:bg-[#202030] transition-colors">
                                            <td className="p-4">
                                                <span className="font-black text-[13px] text-white uppercase tracking-wider">{user.name}</span>
                                            </td>
                                            <td className="p-4">
                                                <span className="text-[11px] font-bold text-gray-400 tracking-wider ">{user.email}</span>
                                            </td>
                                            <td className="p-4">
                                                <span
                                                    className={`inline-block px-2.5 py-1 rounded-sm text-[10px] font-black uppercase tracking-widest border ${user.role === "admin"
                                                        ? "bg-red-500/10 text-red-500 border-red-500/20"
                                                        : "bg-[#f5d800]/10 text-[#f5d800] border-[#f5d800]/20"
                                                        }`}
                                                >
                                                    {user.role}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
