import React, { useState, useEffect } from "react";
import CIcon from "@coreui/icons-react";
import {
    cilPlus, cilX, cilCheck, cilPencil, cilTrash, cilChevronRight,
    cilReload, cilArrowRight, cilLink
} from "@coreui/icons";
import {
    get_sell_questions, create_sell_question, update_sell_question, delete_sell_question,
    create_question_option, delete_question_option,
    get_question_conditions, create_question_condition, delete_question_condition,
    get_categories, map_question_to_category, unmap_question_from_category
} from "../../../api/system_service";

const INPUT_TYPES = [
    { value: "yes_no", label: "Yes / No" },
    { value: "single_select", label: "Single Select" },
    { value: "multi_select", label: "Multi Select" },
];

const inputTypeBadge = (type) => {
    const map = { yes_no: "bg-info", single_select: "bg-primary", multi_select: "bg-warning text-dark" };
    return <span className={`badge ${map[type] || "bg-secondary"}`}>{type.replace("_", " ")}</span>;
};

export default function SellQuestions() {
    const [questions, setQuestions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showAdd, setShowAdd] = useState(false);
    const [saving, setSaving] = useState(false);
    const [expandedId, setExpandedId] = useState(null);

    // Inline edit state
    const [editingId, setEditingId] = useState(null);
    const [editData, setEditData] = useState({ text: "", description: "", input_type: "", sort_index: 1 });

    // Add question form
    const [newQ, setNewQ] = useState({ text: "", description: "", input_type: "yes_no", category_slugs: [] });

    // Options
    const [newOpt, setNewOpt] = useState({ text: "", price_deduction: 0 });
    const [savingOpt, setSavingOpt] = useState(false);

    // Conditions
    const [conditions, setConditions] = useState([]);
    const [loadingConds, setLoadingConds] = useState(false);
    const [newCond, setNewCond] = useState({ trigger_option_id: "", show_question_id: "" });

    // Category mapping
    const [mapCatSlug, setMapCatSlug] = useState("");

    useEffect(() => {
        fetchQuestions();
        fetchCategories();
    }, []);

    const fetchQuestions = async () => {
        try {
            setLoading(true);
            const res = await get_sell_questions();
            setQuestions(res.data);
        } catch (e) {
            console.log(e);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await get_categories("true");
            setCategories(res.data);
        } catch (e) {
            console.log(e);
        }
    };

    const fetchConditions = async (questionId) => {
        try {
            setLoadingConds(true);
            const res = await get_question_conditions(questionId);
            setConditions(res.data);
        } catch {
            setConditions([]);
        } finally {
            setLoadingConds(false);
        }
    };

    // ── Question CRUD ──────────────────────────────────────

    const handleCreateQuestion = async () => {
        if (!newQ.text || !newQ.input_type) return;
        try {
            setSaving(true);
            const nextSortIndex = (questions.length > 0
                ? Math.max(...questions.map(q => q.sort_index))
                : 0) + 1;
            const res = await create_sell_question({
                text: newQ.text,
                description: newQ.description || null,
                input_type: newQ.input_type,
                sort_index: nextSortIndex,
                category_slugs: newQ.category_slugs
            });
            // Auto-create Yes / No options for yes_no questions
            if (newQ.input_type === "yes_no") {
                const newQuestionId = res.data?.id;
                if (newQuestionId) {
                    await Promise.all([
                        create_question_option({ question_id: newQuestionId, text: "Yes", price_deduction: 0, sort_index: 1 }),
                        create_question_option({ question_id: newQuestionId, text: "No", price_deduction: 0, sort_index: 2 }),
                    ]);
                }
            }
            setShowAdd(false);
            setNewQ({ text: "", description: "", input_type: "yes_no", category_slugs: [] });
            fetchQuestions();
        } catch (e) {
            console.log(e?.response?.data?.message || "Failed");
        } finally {
            setSaving(false);
        }
    };

    const startEditing = (q) => {
        setEditingId(q.id);
        setEditData({ text: q.text, description: q.description || "", input_type: q.input_type, sort_index: q.sort_index });
    };

    const handleUpdateQuestion = async () => {
        try {
            setSaving(true);
            await update_sell_question(editingId, {
                text: editData.text,
                description: editData.description || null,
                input_type: editData.input_type,
                sort_index: parseInt(editData.sort_index) || 1
            });
            setEditingId(null);
            fetchQuestions();
        } catch (e) {
            console.log(e?.response?.data?.message || "Failed");
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteQuestion = async (id) => {
        if (!confirm("Deactivate this question?")) return;
        try {
            await delete_sell_question(id);
            fetchQuestions();
            if (expandedId === id) setExpandedId(null);
        } catch (e) {
            console.log(e?.response?.data?.message || "Failed");
        }
    };

    const toggleExpand = (q) => {
        if (expandedId === q.id) {
            setExpandedId(null);
            setConditions([]);
        } else {
            setExpandedId(q.id);
            setEditingId(null);
            fetchConditions(q.id);
        }
    };

    // ── Option CRUD ────────────────────────────────────────

    const handleAddOption = async (questionId) => {
        if (!newOpt.text) return;
        try {
            setSavingOpt(true);
            const question = questions.find(q => q.id === questionId);
            const nextOptSort = ((question?.options?.length) || 0) + 1;
            await create_question_option({
                question_id: questionId,
                text: newOpt.text,
                price_deduction: parseFloat(newOpt.price_deduction) || 0,
                sort_index: nextOptSort
            });
            setNewOpt({ text: "", price_deduction: 0 });
            fetchQuestions();
            fetchConditions(questionId);
        } catch (e) {
            console.log(e?.response?.data?.message || "Failed");
        } finally {
            setSavingOpt(false);
        }
    };

    const handleDeleteOption = async (optId) => {
        if (!confirm("Delete this option?")) return;
        try {
            await delete_question_option(optId);
            fetchQuestions();
            if (expandedId) fetchConditions(expandedId);
        } catch (e) {
            console.log(e?.response?.data?.message || "Failed");
        }
    };

    // ── Condition CRUD ─────────────────────────────────────

    const handleAddCondition = async () => {
        if (!newCond.trigger_option_id || !newCond.show_question_id) return;
        try {
            await create_question_condition({
                trigger_option_id: parseInt(newCond.trigger_option_id),
                show_question_id: parseInt(newCond.show_question_id)
            });
            setNewCond({ trigger_option_id: "", show_question_id: "" });
            fetchConditions(expandedId);
        } catch (e) {
            console.log(e?.response?.data?.message || "Failed");
        }
    };

    const handleDeleteCondition = async (condId) => {
        try {
            await delete_question_condition(condId);
            fetchConditions(expandedId);
        } catch (e) {
            console.log(e?.response?.data?.message || "Failed");
        }
    };

    // ── Category Mapping ───────────────────────────────────

    const handleMapCategory = async (questionId) => {
        if (!mapCatSlug) return;
        try {
            await map_question_to_category({
                category_slug: mapCatSlug,
                question_id: questionId
            });
            setMapCatSlug("");
            fetchQuestions();
        } catch (e) {
            console.log(e?.response?.data?.message || "Failed");
        }
    };

    const handleUnmapCategory = async (categoryId, questionId) => {
        try {
            await unmap_question_from_category(categoryId, questionId);
            fetchQuestions();
        } catch (e) {
            console.log(e?.response?.data?.message || "Failed");
        }
    };

    const toggleCategory = (catSlug) => {
        setNewQ(prev => ({
            ...prev,
            category_slugs: prev.category_slugs.includes(catSlug)
                ? prev.category_slugs.filter(slug => slug !== catSlug)
                : [...prev.category_slugs, catSlug]
        }));
    };

    return (
        <div className="container py-4">
            <div className="card shadow-sm border-0">
                <div className="card-header bg-white d-flex justify-content-between align-items-center">
                    <div>
                        <h4 className="fw-bold text-uppercase mb-0">Sell Questions</h4>
                        <small className="text-muted">Manage evaluation questions, options, conditions &amp; category mappings</small>
                    </div>
                    <div className="d-flex gap-2">
                        <button className="btn btn-sm btn-outline-secondary" onClick={fetchQuestions} disabled={loading}>
                            <CIcon icon={cilReload} />
                        </button>
                        <button className="btn btn-sm btn-primary" onClick={() => setShowAdd(!showAdd)}>
                            <CIcon icon={showAdd ? cilX : cilPlus} className="me-1" />
                            {showAdd ? "Cancel" : "Add Question"}
                        </button>
                    </div>
                </div>

                <div className="card-body">
                    {/* Add Question Form */}
                    {showAdd && (
                        <div className="border rounded p-3 mb-4 bg-white shadow-sm">
                            <h6 className="fw-semibold mb-3">New Question</h6>
                            <div className="row g-2">
                                <div className="col-md-4">
                                    <label className="form-label small fw-semibold">Question Text *</label>
                                    <input
                                        type="text" className="form-control form-control-sm"
                                        placeholder="e.g. Is the screen cracked?"
                                        value={newQ.text}
                                        onChange={e => setNewQ({ ...newQ, text: e.target.value })}
                                    />
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label small fw-semibold">Description</label>
                                    <input
                                        type="text" className="form-control form-control-sm"
                                        placeholder="Helper text shown below question"
                                        value={newQ.description}
                                        onChange={e => setNewQ({ ...newQ, description: e.target.value })}
                                    />
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label small fw-semibold">Input Type *</label>
                                    <select
                                        className="form-select form-select-sm"
                                        value={newQ.input_type}
                                        onChange={e => setNewQ({ ...newQ, input_type: e.target.value })}
                                    >
                                        {INPUT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                    </select>
                                </div>
                                <div className="col-md-2">
                                    <label className="form-label small fw-semibold">Sort Order</label>
                                    <div className="form-control form-control-sm bg-light text-muted" style={{ cursor: "default" }}>
                                        # {(questions.length > 0 ? Math.max(...questions.map(q => q.sort_index)) : 0) + 1}
                                        <span className="ms-1 text-success small">(auto)</span>
                                    </div>
                                </div>
                                <div className="col-12">
                                    <label className="form-label small fw-semibold">Map to Categories</label>
                                    <div className="d-flex flex-wrap gap-2">
                                        {categories.map(c => (
                                            <button
                                                key={c.slug}
                                                className={`btn btn-sm ${newQ.category_slugs.includes(c.slug) ? 'btn-primary' : 'btn-outline-secondary'}`}
                                                onClick={() => toggleCategory(c.slug)}
                                            >
                                                {c.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="d-flex gap-2 mt-3 justify-content-end">
                                <button className="btn btn-sm btn-outline-secondary" onClick={() => setShowAdd(false)}>
                                    <CIcon icon={cilX} className="me-1" /> Cancel
                                </button>
                                <button className="btn btn-sm btn-success" onClick={handleCreateQuestion} disabled={saving || !newQ.text}>
                                    <CIcon icon={cilCheck} className="me-1" /> {saving ? "Saving..." : "Save"}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Questions List */}
                    {loading ? (
                        <div className="d-flex justify-content-center py-5">
                            <div className="spinner-border spinner-border-sm text-primary me-2" />
                            <span className="text-muted small">Loading...</span>
                        </div>
                    ) : questions.length === 0 ? (
                        <div className="text-center text-muted py-5">
                            <div className="fs-3 mb-2">—</div>
                            <div className="small">No questions yet. Add one above.</div>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover align-middle">
                                <thead className="table-light">
                                    <tr>
                                        <th style={{ width: 50 }}>Order</th>
                                        <th className="text-start">Question</th>
                                        <th>Type</th>
                                        <th>Options</th>
                                        <th>Categories</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {questions.map((q) => (
                                        <React.Fragment key={q.id}>
                                            {/* Inline edit row */}
                                            {editingId === q.id ? (
                                                <tr className="table-warning">
                                                    <td>
                                                        <input type="number" className="form-control form-control-sm" style={{ width: 55 }}
                                                            value={editData.sort_index} min="1"
                                                            onChange={e => setEditData({ ...editData, sort_index: e.target.value })} />
                                                    </td>
                                                    <td>
                                                        <input type="text" className="form-control form-control-sm mb-1"
                                                            value={editData.text}
                                                            onChange={e => setEditData({ ...editData, text: e.target.value })} />
                                                        <input type="text" className="form-control form-control-sm"
                                                            placeholder="Description (optional)"
                                                            value={editData.description}
                                                            onChange={e => setEditData({ ...editData, description: e.target.value })} />
                                                    </td>
                                                    <td>
                                                        <select className="form-select form-select-sm"
                                                            value={editData.input_type}
                                                            onChange={e => setEditData({ ...editData, input_type: e.target.value })}>
                                                            {INPUT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                                        </select>
                                                    </td>
                                                    <td colSpan="2"></td>
                                                    <td>
                                                        <div className="d-flex gap-1">
                                                            <button className="btn btn-sm btn-success" onClick={handleUpdateQuestion} disabled={saving || !editData.text}>
                                                                <CIcon icon={cilCheck} />
                                                            </button>
                                                            <button className="btn btn-sm btn-outline-secondary" onClick={() => setEditingId(null)}>
                                                                <CIcon icon={cilX} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : (
                                                <tr className={expandedId === q.id ? "table-active" : ""}>
                                                    <td className="text-center">
                                                        <span className="badge bg-light text-dark border">{q.sort_index}</span>
                                                    </td>
                                                    <td className="text-start">
                                                        <div className="fw-semibold">{q.text}</div>
                                                        {q.description && <small className="text-muted">{q.description}</small>}
                                                    </td>
                                                    <td>{inputTypeBadge(q.input_type)}</td>
                                                    <td>
                                                        <span className="badge bg-secondary rounded-pill">{(q.options || []).length}</span>
                                                    </td>
                                                    <td>
                                                        <div className="d-flex flex-wrap gap-1">
                                                            {(q.categories || []).map(c => (
                                                                <span key={c.id} className="badge bg-light text-dark border">{c.name}</span>
                                                            ))}
                                                            {(!q.categories || q.categories.length === 0) && (
                                                                <span className="text-muted small">None</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="d-flex gap-1">
                                                            <button
                                                                className="btn btn-sm btn-outline-warning"
                                                                onClick={() => startEditing(q)}
                                                                title="Edit question"
                                                            >
                                                                <CIcon icon={cilPencil} />
                                                            </button>
                                                            <button
                                                                className={`btn btn-sm ${expandedId === q.id ? 'btn-primary' : 'btn-outline-info'}`}
                                                                onClick={() => toggleExpand(q)}
                                                                title="Manage Options & Conditions"
                                                            >
                                                                <CIcon icon={cilChevronRight} />
                                                            </button>
                                                            <button
                                                                className="btn btn-sm btn-outline-danger"
                                                                onClick={() => handleDeleteQuestion(q.id)}
                                                                title="Deactivate"
                                                            >
                                                                <CIcon icon={cilTrash} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}

                                            {/* Expanded: Options, Conditions, Category Mapping */}
                                            {expandedId === q.id && (
                                                <tr key={`exp-${q.id}`}>
                                                    <td colSpan="6" className="bg-light p-3">
                                                        <div className="row g-3">
                                                            {/* Options */}
                                                            <div className="col-md-5">
                                                                <h6 className="fw-bold mb-2">
                                                                    Options
                                                                    {q.input_type === "yes_no" && (
                                                                        <span className="ms-2 badge bg-secondary fw-normal" style={{ fontSize: "0.7rem" }}>Fixed: Yes / No</span>
                                                                    )}
                                                                </h6>
                                                                {(q.options || []).length > 0 && (
                                                                    <table className="table table-sm table-bordered mb-2">
                                                                        <thead className="table-light">
                                                                            <tr>
                                                                                <th style={{ width: 40 }}>#</th>
                                                                                <th>Text</th>
                                                                                <th>Deduction (₹)</th>
                                                                                {q.input_type !== "yes_no" && <th></th>}
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            {q.options.map(o => (
                                                                                <tr key={o.id}>
                                                                                    <td className="text-muted small text-center">{o.sort_index}</td>
                                                                                    <td>{o.text}</td>
                                                                                    <td className="text-danger">-₹{Number(o.price_deduction).toLocaleString()}</td>
                                                                                    {q.input_type !== "yes_no" && (
                                                                                        <td>
                                                                                            <button className="btn btn-sm btn-outline-danger p-0 px-1" onClick={() => handleDeleteOption(o.id)}>
                                                                                                <CIcon icon={cilTrash} style={{ width: 14, height: 14 }} />
                                                                                            </button>
                                                                                        </td>
                                                                                    )}
                                                                                </tr>
                                                                            ))}
                                                                        </tbody>
                                                                    </table>
                                                                )}
                                                                {q.input_type === "yes_no" ? (
                                                                    <p className="text-muted small mb-0">Yes / No options are auto-managed by the system.</p>
                                                                ) : (
                                                                    <div className="d-flex gap-2">
                                                                        <input
                                                                            type="text" className="form-control form-control-sm"
                                                                            placeholder="Option text"
                                                                            value={newOpt.text}
                                                                            onChange={e => setNewOpt({ ...newOpt, text: e.target.value })}
                                                                        />
                                                                        <input
                                                                            type="number" className="form-control form-control-sm" style={{ maxWidth: 90 }}
                                                                            placeholder="₹ Deduct"
                                                                            value={newOpt.price_deduction}
                                                                            onChange={e => setNewOpt({ ...newOpt, price_deduction: e.target.value })}
                                                                        />
                                                                        <button
                                                                            className="btn btn-sm btn-success"
                                                                            onClick={() => handleAddOption(q.id)}
                                                                            disabled={savingOpt || !newOpt.text}
                                                                        >
                                                                            <CIcon icon={cilPlus} />
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* Conditions */}
                                                            <div className="col-md-4">
                                                                <h6 className="fw-bold mb-2">Conditions</h6>
                                                                <small className="text-muted d-block mb-2">When an option is selected, show a question that comes <strong>after</strong> this one</small>
                                                                {loadingConds ? (
                                                                    <div className="text-muted small">Loading...</div>
                                                                ) : (
                                                                    <>
                                                                        {conditions.map(c => (
                                                                            <div key={c.id} className="d-flex align-items-center gap-1 mb-1 small">
                                                                                <span className="badge bg-info">{c.trigger_option_text}</span>
                                                                                <CIcon icon={cilArrowRight} style={{ width: 12 }} />
                                                                                <span className="badge bg-warning text-dark">{c.show_question_text}</span>
                                                                                <button className="btn btn-sm p-0 px-1 btn-outline-danger ms-auto" onClick={() => handleDeleteCondition(c.id)}>
                                                                                    <CIcon icon={cilX} style={{ width: 12, height: 12 }} />
                                                                                </button>
                                                                            </div>
                                                                        ))}
                                                                        <div className="d-flex gap-1 mt-2">
                                                                            <select
                                                                                className="form-select form-select-sm"
                                                                                value={newCond.trigger_option_id}
                                                                                onChange={e => setNewCond({ ...newCond, trigger_option_id: e.target.value })}
                                                                            >
                                                                                <option value="">If option...</option>
                                                                                {(q.options || []).map(o => (
                                                                                    <option key={o.id} value={o.id}>{o.text}</option>
                                                                                ))}
                                                                            </select>
                                                                            <select
                                                                                className="form-select form-select-sm"
                                                                                value={newCond.show_question_id}
                                                                                onChange={e => setNewCond({ ...newCond, show_question_id: e.target.value })}
                                                                            >
                                                                                <option value="">Then show...</option>
                                                                                {questions
                                                                                    .filter(oq => oq.sort_index > q.sort_index)
                                                                                    .map(oq => (
                                                                                        <option key={oq.id} value={oq.id}>[#{oq.sort_index}] {oq.text}</option>
                                                                                    ))
                                                                                }
                                                                            </select>
                                                                            <button
                                                                                className="btn btn-sm btn-success"
                                                                                onClick={handleAddCondition}
                                                                                disabled={!newCond.trigger_option_id || !newCond.show_question_id}
                                                                            >
                                                                                <CIcon icon={cilLink} />
                                                                            </button>
                                                                        </div>
                                                                    </>
                                                                )}
                                                            </div>

                                                            {/* Category Mapping */}
                                                            <div className="col-md-3">
                                                                <h6 className="fw-bold mb-2">Categories</h6>
                                                                <div className="d-flex flex-wrap gap-1 mb-2">
                                                                    {(q.categories || []).map(c => (
                                                                        <span key={c.id} className="badge bg-primary d-flex align-items-center gap-1">
                                                                            {c.name}
                                                                            <button
                                                                                className="btn-close btn-close-white p-0 ms-1"
                                                                                style={{ fontSize: "0.5rem" }}
                                                                                onClick={() => handleUnmapCategory(c.id, q.id)}
                                                                            />
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                                <div className="d-flex gap-1">
                                                                    <select
                                                                        className="form-select form-select-sm"
                                                                        value={mapCatSlug}
                                                                        onChange={e => setMapCatSlug(e.target.value)}
                                                                    >
                                                                        <option value="">Add category...</option>
                                                                        {categories
                                                                            .filter(c => !(q.categories || []).find(qc => qc.id === c.id))
                                                                            .map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)
                                                                        }
                                                                    </select>
                                                                    <button
                                                                        className="btn btn-sm btn-success"
                                                                        onClick={() => handleMapCategory(q.id)}
                                                                        disabled={!mapCatSlug}
                                                                    >
                                                                        <CIcon icon={cilPlus} />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <div className="text-muted small mt-2">
                        Total: {questions.length} questions
                    </div>
                </div>
            </div>
        </div>
    );
}
