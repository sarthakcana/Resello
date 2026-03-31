import React, { useEffect, useMemo, useState } from 'react'
import { get_services, delete_service, create_service } from "src/api/system_service"
import CIcon from '@coreui/icons-react'
import { cilNoteAdd, cilPlus, cilX } from '@coreui/icons'
import ThemedTablePage from 'src/components/ThemedTablePage'

const Services = () => {
    const [services, setServices] = useState([])
    const [isService, setIsService] = useState(false)
    const [service, setService] = useState("")
    const [file, setFile] = useState(null)
    const [query, setQuery] = useState('')

    const toggleService = () => setIsService(!isService)

    const fetchServices = async () => {
        try {
            const response = await get_services()
            if (response.status === 200) setServices(response.data)
        } catch (err) {
            console.error(err)
        }
    }

    useEffect(() => {
        fetchServices()
    }, [])

    const createService = async (e) => {
        e.preventDefault();
        if (!service || !file) return alert("Service & Image are required")
        if (confirm(`Is spelled "${service}" correct?`)) {
            const formData = new FormData();
            formData.append("name", service);
            formData.append("image", file);
            console.log(formData.get('image'));

            const response = await create_service(formData)
            if (response.status === 200) {
                fetchServices()
                toggleService()
                setService("")
            }
        }
    }

    const deleteService = async (id) => {
        if (!id) return
        if (confirm("Delete this service?")) {
            const response = await delete_service(id)
            if (response.status === 200) {
                setServices(services.filter(s => s.id !== id))
            }
        }
    }

    const filteredServices = useMemo(() => {
        const q = query.trim().toLowerCase()
        if (!q) return services
        return services.filter((s) => String(s?.name || '').toLowerCase().includes(q))
    }, [services, query])

    const rows = useMemo(
        () => filteredServices.map((s, idx) => ({ ...s, _rowIndex: idx + 1 })),
        [filteredServices],
    )

    const columns = useMemo(
        () => [
            {
                key: '_rowIndex',
                label: '#',
                render: (s) => s._rowIndex,
                headerClassName: 'text-center',
                cellClassName: 'text-center',
                headerStyle: { width: 70 },
            },
            {
                key: 'name',
                label: 'Name',
                render: (s) => s?.name,
            },
            {
                key: 'image',
                label: 'Image',
                headerClassName: 'text-center',
                cellClassName: 'text-center',
                render: (s) => (
                    <img
                        className="rounded"
                        src={import.meta.env.VITE_API_URL + 'uploads/' + s.url}
                        alt=""
                        style={{ width: '3rem' }}
                    />
                ),
            },
            {
                key: 'action',
                label: 'Action',
                headerClassName: 'text-center',
                cellClassName: 'text-center',
                render: (s) => (
                    <>
                        <button className="btn btn-sm btn-outline-success me-2">Edit</button>
                        <button onClick={() => deleteService(s.id)} className="btn btn-sm btn-outline-danger">
                            Delete
                        </button>
                    </>
                ),
            },
        ],
        [deleteService],
    )

    const filtersContent = (
        <div className="d-grid gap-2">
            <div>
                <div className="small text-medium-emphasis mb-1">Search</div>
                <input
                    className="form-control form-control-sm"
                    placeholder="Search service name"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
            </div>
            <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={() => setQuery('')}
                disabled={!query}
            >
                Reset
            </button>
        </div>
    )

    const topContent = (
        <>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                    <h4 className="fw-bold mb-0 text-uppercase">Manage Services</h4>
                </div>
            </div>

            {isService && (
                <div className="row g-2 mb-4 align-items-center">
                    <div className="col-md-5">
                        <input
                            type="text"
                            value={service}
                            onChange={(e) => setService(e.target.value)}
                            className="form-control"
                            placeholder="Enter unique service name"
                        />
                    </div>
                    <div className="col-md-4 d-flex justify-content-center">
                        <input type="file" onChange={(e) => setFile(e.target.files[0])} accept="image/*" />
                    </div>
                    <div className="col-md-3">
                        <button onClick={createService} className="btn btn-success me-2">
                            <CIcon icon={cilNoteAdd} className="me-1" />
                            Save
                        </button>
                        <button onClick={toggleService} className="btn btn-outline-secondary">
                            <CIcon icon={cilX} className="me-1" />
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </>
    )

    return (
        <div className="container py-4">
            <ThemedTablePage
                actions={{
                    filtersContent,
                    onExport: null,
                    primary: !isService
                        ? {
                            label: 'Add Service',
                            color: 'primary',
                            icon: <CIcon icon={cilPlus} />,
                            onClick: toggleService,
                        }
                        : null,
                }}
                topContent={topContent}
                columns={columns}
                rows={rows}
                rowKey={(s) => s.id}
                emptyText={services.length === 0 ? 'No Services Found' : 'No Services match your filters'}
                footerLeft={
                    <div className="small text-medium-emphasis">
                        Showing {filteredServices.length} of {services.length} services
                    </div>
                }
            />
        </div>
    )
}

export default Services
