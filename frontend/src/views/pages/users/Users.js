import React, { useState, useEffect } from "react"
import { CIcon } from '@coreui/icons-react'
import { cilPlus } from '@coreui/icons'
import { get_users, delete_user } from "src/api/system_service"

const STATUS_OPTIONS = [
    { id: 1, name: "Active", color: "#4CAF50" },
    { id: 2, name: "Suspended", color: "#FF9800" },
    { id: 3, name: "Deleted", color: "#F44336" },
]

const Users = () => {
    const [users, setUsers] = useState([])

    const [isAddUser, setIsAddUser] = useState(false)
    const [email, setEmail] = useState("")
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [status, setStatus] = useState(1)


    const getUsers = async () => {
        try {
            const response = await get_users();
            console.log(response.data);
            if (response.status == 200)
                setUsers(response.data);
        } catch (err) {
            console.error(err);
        }
    }

    useEffect(() => {
        getUsers();
    }, [])

    // const toggleAddUser = () => {
        // setIsAddUser(!isAddUser)
        // if (isAddUser) clearForm()
    // }

    // const clearForm = () => {
    //     setEmail("")
    //     setFirstName("")
    //     setLastName("")
    //     setStatus(1)
    // }

    const createUser = () => {
        // if (!email) return alert("Email is required")
        // const newUser = {
        //     id: users.length + 1,
        //     email,
        //     first_name: firstName,
        //     last_name: lastName,
        //     status,
        // }
        // setUsers([...users, newUser])
        // toggleAddUser()
    }

    const deleteUser = async (id) => {
        if (!id) return
        if (confirm("Delete this user?")) {
            await delete_user(id);
            setUsers(users.filter(u => u.id !== id))
        }
    }
    return (
        <div className="container py-4">
            <div className="card shadow-sm border-0">
                <div className="card-body">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle">
                            <thead className="table-light">
                                <tr className="text-center">
                                    <th>#</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.length > 0 ? users.map((u, idx) => {
                                    const statusObj = STATUS_OPTIONS.find(s => s.id === u.status)
                                    return (
                                        <tr key={u.id} className="text-center">
                                            <td>{idx + 1}</td>
                                            <td>{`${u.first_name || ""} ${u.last_name || ""}`}</td>
                                            <td>{u.email}</td>
                                            <td>{u.role}</td>
                                            <td>
                                                <button className="btn btn-sm btn-outline-primary" onClick={() => toggleActivate(u.id)}>
                                                    Activate
                                                </button>
                                                <button className="btn btn-sm btn-outline-danger" onClick={() => toggleActivate(u.id)}>
                                                    Suspend
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                }) : (
                                    <tr>
                                        <td colSpan="5" className="text-center text-muted py-4">
                                            No Users Found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                </div>
            </div>
        </div>
    )
}

export default Users
