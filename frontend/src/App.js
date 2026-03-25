import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./App.css";

const api = axios.create({
  baseURL: "http://localhost:8000/api",
});

const initialFormState = {
  id: "",
  name: "",
  description: "",
  price: "",
  quantity: "",
};

function App() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(initialFormState);
  const [editId, setEditId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("");
  const [sortField, setSortField] = useState("id");
  const [sortDirection, setSortDirection] = useState("asc");

  useEffect(() => {
    if (!message) return undefined;
    const timer = setTimeout(() => setMessage(""), 5000);
    return () => clearTimeout(timer);
  }, [message]);

  useEffect(() => {
    if (!error) return undefined;
    const timer = setTimeout(() => setError(""), 5000);
    return () => clearTimeout(timer);
  }, [error]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get("/products/");
      setProducts(res.data);
      setError("");
    } catch (err) {
      setError("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }
    setSortField(field);
    setSortDirection("asc");
  };

  const filteredProducts = useMemo(() => {
    const query = filter.trim().toLowerCase();
    const visibleProducts = query
      ? products.filter((product) => {
          return (
            String(product.id).includes(query) ||
            product.name?.toLowerCase().includes(query) ||
            product.description?.toLowerCase().includes(query)
          );
        })
      : products;

    return [...visibleProducts].sort((a, b) => {
      let left = a[sortField];
      let right = b[sortField];

      if (sortField === "id" || sortField === "price" || sortField === "quantity") {
        left = Number(left);
        right = Number(right);
      } else {
        left = String(left).toLowerCase();
        right = String(right).toLowerCase();
      }

      if (left < right) return sortDirection === "asc" ? -1 : 1;
      if (left > right) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [filter, products, sortDirection, sortField]);

  const inventoryValue = useMemo(() => {
    return products.reduce((total, product) => total + Number(product.price) * Number(product.quantity), 0);
  }, [products]);

  const lowStockCount = useMemo(() => {
    return products.filter((product) => Number(product.quantity) <= 10).length;
  }, [products]);

  const handleChange = (e) => {
    setForm((current) => ({ ...current, [e.target.name]: e.target.value }));
  };

  const resetForm = () => {
    setForm(initialFormState);
    setEditId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    const payload = {
      ...form,
      id: Number(form.id),
      price: Number(form.price),
      quantity: Number(form.quantity),
    };

    try {
      if (editId) {
        await api.put(`/products/${editId}`, payload);
        setMessage("Product updated successfully");
      } else {
        await api.post("/products/", payload);
        setMessage("Product created successfully");
      }
      resetForm();
      await fetchProducts();
    } catch (err) {
      setError(err.response?.data?.detail || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setForm({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      quantity: product.quantity,
    });
    setEditId(product.id);
    setMessage("");
    setError("");
  };

  const handleDelete = async (id) => {
    const ok = window.confirm("Delete this product?");
    if (!ok) return;

    setLoading(true);
    setMessage("");
    setError("");
    try {
      await api.delete(`/products/${id}`);
      setMessage("Product deleted successfully");
      await fetchProducts();
    } catch (err) {
      setError(err.response?.data?.detail || "Delete failed");
    } finally {
      setLoading(false);
    }
  };

  const currency = (n) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }).format(Number(n || 0));
  };

  return (
    <div className="app-shell">
      <div className="app-backdrop" />
      <div className="app-bg">
        <header className="hero">
          <div className="hero-copy">
            <p className="eyebrow">Inventory Control</p>
            <h1>Manage products without losing the thread.</h1>
            <p className="hero-text">
              Track stock, update pricing, and keep the catalog clean from one screen.
            </p>
          </div>
          <div className="hero-actions">
            <button className="btn btn-ghost" onClick={fetchProducts} disabled={loading}>
              Refresh data
            </button>
            <div className="hero-note">Connected to FastAPI + PostgreSQL</div>
          </div>
        </header>

        <section className="metrics-grid">
          <article className="metric-card">
            <span className="metric-label">Products</span>
            <strong>{products.length}</strong>
            <p>Visible inventory entries in the database.</p>
          </article>
          <article className="metric-card">
            <span className="metric-label">Low stock</span>
            <strong>{lowStockCount}</strong>
            <p>Items with quantity at or below 10 units.</p>
          </article>
          <article className="metric-card">
            <span className="metric-label">Inventory value</span>
            <strong>{currency(inventoryValue)}</strong>
            <p>Total catalog value based on price x quantity.</p>
          </article>
        </section>

        <section className="content-grid">
          <aside className="panel form-panel">
            <div className="panel-heading">
              <div>
                <p className="panel-kicker">{editId ? "Editing mode" : "Create product"}</p>
                <h2>{editId ? `Update product #${editId}` : "Add a new product"}</h2>
              </div>
              {editId && <span className="status-pill">Editing</span>}
            </div>

            <form onSubmit={handleSubmit} className="product-form">
              <label className="field">
                <span>Product ID</span>
                <input
                  type="number"
                  name="id"
                  placeholder="101"
                  value={form.id}
                  onChange={handleChange}
                  required
                  disabled={Boolean(editId)}
                />
              </label>

              <label className="field">
                <span>Name</span>
                <input
                  type="text"
                  name="name"
                  placeholder="Premium Keyboard"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </label>

              <label className="field field-full">
                <span>Description</span>
                <textarea
                  name="description"
                  placeholder="Brief product summary for operators and customers."
                  value={form.description}
                  onChange={handleChange}
                  required
                  rows={4}
                />
              </label>

              <label className="field">
                <span>Price</span>
                <input
                  type="number"
                  name="price"
                  placeholder="149.99"
                  value={form.price}
                  onChange={handleChange}
                  required
                  step="0.01"
                  min="0"
                />
              </label>

              <label className="field">
                <span>Quantity</span>
                <input
                  type="number"
                  name="quantity"
                  placeholder="24"
                  value={form.quantity}
                  onChange={handleChange}
                  required
                  min="0"
                />
              </label>

              <div className="form-actions">
                <button className="btn" type="submit" disabled={loading}>
                  {editId ? "Save changes" : "Create product"}
                </button>
                <button className="btn btn-secondary" type="button" onClick={resetForm}>
                  Clear form
                </button>
              </div>
            </form>

            {(message || error) && (
              <div className="feedback-stack">
                {message && <div className="success-msg">{message}</div>}
                {error && <div className="error-msg">{error}</div>}
              </div>
            )}
          </aside>

          <section className="panel table-panel">
            <div className="panel-heading table-heading">
              <div>
                <p className="panel-kicker">Catalog</p>
                <h2>Product list</h2>
              </div>
              <label className="search-field">
                <span>Search</span>
                <input
                  type="text"
                  placeholder="Search by id, name, or description"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                />
              </label>
            </div>

            <div className="table-toolbar">
              <div className="toolbar-chip">
                {filteredProducts.length} result{filteredProducts.length === 1 ? "" : "s"}
              </div>
              <div className="toolbar-note">
                Sort by clicking the ID, Name, Price, or Quantity columns.
              </div>
            </div>

            {loading ? (
              <div className="empty-state loading-state">
                <div className="loader-ring" />
                <p>Loading products...</p>
              </div>
            ) : (
              <div className="table-wrap">
                <table className="product-table">
                  <thead>
                    <tr>
                      <th
                        className={`sortable ${sortField === "id" ? `sort-${sortDirection}` : ""}`}
                        onClick={() => handleSort("id")}
                      >
                        ID
                      </th>
                      <th
                        className={`sortable ${sortField === "name" ? `sort-${sortDirection}` : ""}`}
                        onClick={() => handleSort("name")}
                      >
                        Name
                      </th>
                      <th>Description</th>
                      <th
                        className={`sortable ${sortField === "price" ? `sort-${sortDirection}` : ""}`}
                        onClick={() => handleSort("price")}
                      >
                        Price
                      </th>
                      <th
                        className={`sortable ${sortField === "quantity" ? `sort-${sortDirection}` : ""}`}
                        onClick={() => handleSort("quantity")}
                      >
                        Quantity
                      </th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product) => (
                      <tr key={product.id}>
                        <td>#{product.id}</td>
                        <td className="name-cell">{product.name}</td>
                        <td className="desc-cell" title={product.description}>
                          {product.description}
                        </td>
                        <td className="price-cell">{currency(product.price)}</td>
                        <td>
                          <span
                            className={`qty-badge ${Number(product.quantity) <= 10 ? "qty-low" : ""}`}
                          >
                            {product.quantity}
                          </span>
                        </td>
                        <td>
                          <div className="row-actions">
                            <button className="btn btn-edit" onClick={() => handleEdit(product)}>
                              Edit
                            </button>
                            <button className="btn btn-delete" onClick={() => handleDelete(product.id)}>
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filteredProducts.length === 0 && (
                  <div className="empty-state">
                    <h3>No products found</h3>
                    <p>Try a broader search or add a new product from the form.</p>
                  </div>
                )}
              </div>
            )}
          </section>
        </section>
      </div>
    </div>
  );
}

export default App;
