import React, { useState } from "react";
import './EventForm.css';

export default function EventForm({ onCreate }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    venue: "",
    capacity: "",
    startTime: "",
    endTime: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreate(form);
    setForm({
      title: "",
      description: "",
      venue: "",
      capacity: "",
      startTime: "",
      endTime: ""
    });
  };

  return (
    <form className="card form-card" onSubmit={handleSubmit}>
      <h2>Create Event</h2>
      <div className="field">
        <label>Title</label>
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          required
        />
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
        <label>Venue</label>
        <input
          name="venue"
          value={form.venue}
          onChange={handleChange}
        />
      </div>
      <div className="field">
        <label>Capacity</label>
        <input
          name="capacity"
          type="number"
          value={form.capacity}
          onChange={handleChange}
        />
      </div>
      <div className="field">
        <label>Start Time</label>
        <input
          name="startTime"
          type="datetime-local"
          value={form.startTime}
          onChange={handleChange}
          required
        />
      </div>
      <div className="field">
        <label>End Time</label>
        <input
          name="endTime"
          type="datetime-local"
          value={form.endTime}
          onChange={handleChange}
          required
        />
      </div>
      <button className="primary-btn" type="submit">
        Create Event
      </button>
    </form>
  );
}
