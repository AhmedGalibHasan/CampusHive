import React, { useState } from "react";
import './ClubForm.css';

export default function ClubForm({ onCreate }) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "other",
    logo: null
  });
  const [logoPreview, setLogoPreview] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm((prev) => ({ ...prev, logo: file }));
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const fd = new FormData();
    fd.append("name", form.name);
    fd.append("description", form.description);
    fd.append("category", form.category);
    if (form.logo) fd.append("logo", form.logo);

    onCreate(fd);

    setForm({ name: "", description: "", category: "other", logo: null });
    setLogoPreview(null);
    // Reset file input
    e.target.reset();
  };

  return (
    <form className="clubForm card form-card" onSubmit={handleSubmit}>
      <h2>Create Club</h2>

      <div className="field">
        <label>Club Name</label>
        <input name="name" value={form.name} onChange={handleChange} required />
      </div>

      <div className="field">
        <label>Description</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
        />
      </div>

      <div className="field">
        <label>Category *</label>
        <select
          name="category"
          value={form.category}
          onChange={handleChange}
          required
          className="category-select"
        >
          <option value="sports">Sports</option>
          <option value="cultural">Cultural</option>
          <option value="academic">Academic</option>
          <option value="other">Other</option>
        </select>
        <p className="muted small clubForm-helpText">
          Select the category that best describes your club.
        </p>
      </div>

      <div className="field">
        <label>Club Logo (Image)</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleLogoChange}
        />
        {logoPreview && (
          <div className="logo-preview-container">
            <img 
              src={logoPreview} 
              alt="Logo preview" 
              className="logo-preview"
            />
            <p className="muted small">Logo preview</p>
          </div>
        )}
        <p className="muted small clubForm-helpText">
          Upload a logo image for your club. This will be displayed next to the club name.
        </p>
      </div>

      <button className="primary-btn" type="submit">
        Create Club
      </button>
    </form>
  );
}
