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
        <main className="p-6 bg-gray-100 flex-1">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {stats.map((stat) => (
              <div
                key={stat.title}
                className={`p-6 rounded-xl shadow-card ${stat.color} text-white`}
              >
                <h3 className="text-lg font-semibold">{stat.title}</h3>
                <p className="text-2xl font-bold mt-2">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-xl shadow-card overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-4 font-semibold">Name</th>
                  <th className="p-4 font-semibold">Email</th>
                  <th className="p-4 font-semibold">Role</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, idx) => (
                  <tr key={idx} className="border-b last:border-b-0">
                    <td className="p-4">{user.name}</td>
                    <td className="p-4">{user.email}</td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 rounded-full text-white ${
                          user.role === "admin"
                            ? "bg-danger-500"
                            : "bg-primary-500"
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
        </main>
      </div>
    </div>
  );
}
