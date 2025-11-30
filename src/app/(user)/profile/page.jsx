"use client";

import { useSelector } from "react-redux";

export default function ProfilePage() {

    const user = useSelector((state) => state?.auth?.user);

    return (
        <div className="max-w-4xl mx-auto mt-8">

            <h1 className="text-2xl font-bold mb-6 text-primary-600">Profile</h1>


            <div className="bg-white shadow-card rounded-xl p-6 flex flex-col md:flex-row items-center gap-6">

                <img
                    src={user?.avatar}
                    alt="Avatar"
                    className="w-32 h-32 rounded-full object-cover border-2 border-primary-200"
                />


                <div className="flex-1">
                    <h2 className="text-xl font-semibold mb-2">{user?.name}</h2>
                    <p className="text-gray-600 mb-1">
                        <span className="font-semibold">Email:</span> {user?.email}
                    </p>
                    <p className="text-gray-600 mb-4">
                        <span className="font-semibold">Role:</span> {user?.role}
                    </p>


                    <button className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition">
                        Edit Profile
                    </button>
                </div>
            </div>
        </div>
    );
}
