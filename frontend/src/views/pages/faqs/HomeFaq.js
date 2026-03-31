import { useEffect, useState } from 'react'
import { getFaqs, deleteFaq, toggleFaqStatus } from '../../../api/faq.api'
import Swal from 'sweetalert2'
import { useNavigate } from 'react-router-dom'
import ThemedTablePage from 'src/components/ThemedTablePage'

const HomeFaqs = () => {
  const navigate = useNavigate()

  const [faqs, setFaqs] = useState([])
  const [loading, setLoading] = useState(true)

  const [currentPage, setCurrentPage] = useState(1)
  const faqsPerPage = 10
  const [query, setQuery] = useState('')

  const loadFaqs = async () => {
    try {
      const res = await getFaqs()
      setFaqs(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadFaqs()
  }, [])

  // DELETE FAQ
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Delete FAQ?',
      text: 'This FAQ will be permanently deleted.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, delete it',
    })

    if (result.isConfirmed) {
      try {
        await deleteFaq(id)
        await loadFaqs()

        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'FAQ deleted successfully.',
          timer: 1500,
          showConfirmButton: false,
        })
      } catch (err) {
        console.error(err)
        Swal.fire('Error', 'Failed to delete FAQ', 'error')
      }
    }
  }

  // TOGGLE STATUS
  const handleToggle = async (faq) => {
    try {
      const newStatus = !faq.status

      await toggleFaqStatus(faq.id, newStatus)

      setFaqs((prev) =>
        prev.map((f) => (f.id === faq.id ? { ...f, status: newStatus } : f))
      )
    } catch (err) {
      console.error(err)
      Swal.fire('Error', 'Failed to update status', 'error')
    }
  }

  const filteredFaqs = query.trim()
    ? faqs.filter((f) => String(f?.question || '').toLowerCase().includes(query.trim().toLowerCase()))
    : faqs

  // PAGINATION
  const indexOfLast = currentPage * faqsPerPage
  const indexOfFirst = indexOfLast - faqsPerPage
  const currentFaqs = filteredFaqs.slice(indexOfFirst, indexOfLast)

  const totalPages = Math.ceil(filteredFaqs.length / faqsPerPage)

  const rows = currentFaqs.map((f, index) => ({ ...f, _rowIndex: indexOfFirst + index + 1 }))

  const columns = [
    { key: '_rowIndex', label: 'Sr No', render: (f) => f._rowIndex, headerStyle: { width: 80 } },
    { key: 'question', label: 'Question', render: (f) => f.question },
    {
      key: 'status',
      label: 'Status',
      render: (f) => (
        <div className="form-check form-switch">
          <input
            className="form-check-input"
            type="checkbox"
            checked={Boolean(f.status)}
            onChange={() => handleToggle(f)}
          />
        </div>
      ),
    },
    {
      key: 'action',
      label: 'Action',
      render: (f) => (
        <>
          <button className="btn btn-sm btn-primary me-2" onClick={() => navigate(`/faqs/edit/${f.id}`)}>
            Edit
          </button>
          <button className="btn btn-sm btn-danger" onClick={() => handleDelete(f.id)}>
            Delete
          </button>
        </>
      ),
    },
  ]

  const filtersContent = (
    <div className="d-grid gap-2">
      <div>
        <div className="small text-medium-emphasis mb-1">Search</div>
        <input
          className="form-control form-control-sm"
          placeholder="Search question"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setCurrentPage(1)
          }}
        />
      </div>
      <button
        type="button"
        className="btn btn-sm btn-outline-secondary"
        onClick={() => {
          setQuery('')
          setCurrentPage(1)
        }}
        disabled={!query}
      >
        Reset
      </button>
    </div>
  )

  return (
    <div className="container py-4">
      <ThemedTablePage
        actions={{
          filtersContent,
          onExport: null,
          primary: {
            label: 'Add FAQ',
            color: 'success',
            onClick: () => navigate('/faqs/add'),
          },
        }}
        topContent={<div className="mb-3"><h4 className="fw-bold mb-0 text-uppercase">Manage FAQs</h4></div>}
        columns={columns}
        rows={rows}
        rowKey={(f) => f.id}
        loading={loading}
        emptyText={filteredFaqs.length === 0 ? 'No FAQs found' : 'No FAQs match your filters'}
        footerLeft={
          <div className="small text-medium-emphasis">
            Showing {rows.length} of {filteredFaqs.length} FAQs
          </div>
        }
        pagination={
          totalPages > 1
            ? {
              page: currentPage,
              totalPages,
              onChange: (p) => setCurrentPage(p),
            }
            : null
        }
      />
    </div>
  )
}

export default HomeFaqs
