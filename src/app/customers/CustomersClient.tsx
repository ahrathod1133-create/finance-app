/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import styles from "./customers.module.css";
import { createCustomer, deleteCustomer } from "@/actions/customer";
import { Plus, Search, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CustomersClient({ initialCustomers }: { initialCustomers: any[] }) {
  const [customers, setCustomers] = useState(initialCustomers);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearch(query);
    if (!query) {
      setCustomers(initialCustomers);
      return;
    }
    const filtered = initialCustomers.filter(
      c => c.fullName.toLowerCase().includes(query) || c.mobileNumber.includes(query)
    );
    setCustomers(filtered);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const res = await createCustomer(formData);
    if (res.success) {
      setShowModal(false);
      router.refresh();
      // Reset search
      setSearch("");
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this customer?")) return;
    await deleteCustomer(id);
    router.refresh();
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Customers</h1>
        <button className={styles.btnPrimary} onClick={() => setShowModal(true)}>
          <Plus size={20} />
          New Customer
        </button>
      </header>

      <div className={styles.searchContainer}>
        <Search size={20} className={styles.searchIcon} />
        <input 
          type="text" 
          placeholder="Search by name or phone..." 
          className={styles.searchInput}
          value={search}
          onChange={handleSearch}
        />
      </div>

      <div className={styles.grid}>
        {customers.map(c => (
          <div key={c.id} className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>{c.fullName}</h3>
              <button className={styles.iconBtn} onClick={() => handleDelete(c.id)}>
                <Trash2 size={16} />
              </button>
            </div>
            <div className={styles.cardBody}>
              <p><strong>Phone:</strong> {c.mobileNumber}</p>
              {c.city && <p><strong>City:</strong> {c.city}</p>}
              <p><strong>Status:</strong> <span className={styles.statusBadge}>{c.status}</span></p>
            </div>
          </div>
        ))}
        {customers.length === 0 && (
          <div className={styles.emptyState}>No customers found.</div>
        )}
      </div>

      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>Add Customer</h2>
              <button className={styles.iconBtn} onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.inputGroup}>
                <label>Full Name *</label>
                <input name="fullName" required />
              </div>
              <div className={styles.inputGroup}>
                <label>Mobile Number *</label>
                <input name="mobileNumber" required />
              </div>
              <div className={styles.inputGroup}>
                <label>Alternate Number</label>
                <input name="alternateNumber" />
              </div>
              <div className={styles.inputGroup}>
                <label>Address</label>
                <input name="address" />
              </div>
              <div className={styles.row}>
                <div className={styles.inputGroup}>
                  <label>City</label>
                  <input name="city" />
                </div>
                <div className={styles.inputGroup}>
                  <label>State</label>
                  <input name="state" />
                </div>
              </div>
              <div className={styles.inputGroup}>
                <label>Notes</label>
                <textarea name="notes" rows={3}></textarea>
              </div>
              <button type="submit" className={styles.btnPrimary} disabled={loading}>
                {loading ? "Saving..." : "Save Customer"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
