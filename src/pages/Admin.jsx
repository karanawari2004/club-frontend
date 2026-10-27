
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import "./Admin.css";

export default function Admin({ onLogout }) {
  const navigate = useNavigate();

  
  const ACTIVATION_RATE = 84.746;
  const MANPOWER_RATE = 1186.45;

  
  const [clubName, setClubName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventEndDate, setEventEndDate] = useState("");
  const [eventId, setEventId] = useState("");

  const [topUps, setTopUps] = useState("");
  const [sales, setSales] = useState("");
  const [devices, setDevices] = useState("");
  const [days, setDays] = useState("");

  const [card, setCard] = useState("");
  const [cash, setCash] = useState("");
  const [upi, setUpi] = useState("");

  
  const [activations, setActivations] = useState("");
  const [manPower, setManPower] = useState("");

  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  

  const handleLogout = async () => {
    try {
      await api.post("/logout");
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      
      sessionStorage.removeItem("isLoggedIn");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("userRole");

      
      if (onLogout) {
        onLogout();
      } else {

        navigate("/login", { replace: true });
      }
    }
  };

  

  const fetchHistory = async () => {
    try {
      setHistoryLoading(true);

      const response = await api.get("/admin");

      if (response.data.success) {
        setHistory(response.data.data || []);
      } else {
        setHistory([]);
      }
    } catch (error) {
      console.error("Fetch history error:", error);
      alert("Unable to fetch report history.");
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  

  const resetForm = () => {
    setClubName("");
    setEventDate("");
    setEventEndDate("");
    setEventId("");

    setTopUps("");
    setSales("");
    setDevices("");
    setDays("");

    setCard("");
    setCash("");
    setUpi("");

    setActivations("");
    setManPower("");
  };

  

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !clubName.trim() ||
      !eventId.trim() ||
      !eventDate ||
      !eventEndDate
    ) {
      alert(
        "Please fill in the club name, event ID, start date, and end date."
      );
      return;
    }

    if (new Date(eventEndDate) < new Date(eventDate)) {
      alert(
        "Event end date cannot be earlier than the event start date."
      );
      return;
    }

    const numericValues = {
      topUps: Number(topUps || 0),
      sales: Number(sales || 0),
      devices: Number(devices || 0),
      days: Number(days || 1),
      card: Number(card || 0),
      cash: Number(cash || 0),
      upi: Number(upi || 0),
      activations: Number(activations || 0),
      manPower: Number(manPower || 0),
    };

    // Validate numeric values
    for (const [field, value] of Object.entries(numericValues)) {
      if (!Number.isFinite(value) || value < 0) {
        alert(`${field} must be a valid non-negative number.`);
        return;
      }
    }

    if (!Number.isInteger(numericValues.devices)) {
      alert("Devices must be a whole number.");
      return;
    }

    if (
      !Number.isInteger(numericValues.days) ||
      numericValues.days < 1
    ) {
      alert("Days must be a whole number greater than zero.");
      return;
    }

    if (
      !Number.isInteger(numericValues.activations) ||
      !Number.isInteger(numericValues.manPower)
    ) {
      alert("Activations and manpower must be whole numbers.");
      return;
    }

    // Data sent to backend
    const formData = {
      clubName: clubName.trim(),
      eventId: eventId.trim(),
      eventDate,
      eventEndDate,
      ...numericValues,
    };

    try {
      setLoading(true);

      const response = await api.post("/admin", formData);

      if (response.data.success) {
        alert("Report saved successfully!");

        resetForm();

        await fetchHistory();
      } else {
        alert(response.data.message || "Unable to save report.");
      }
    } catch (error) {
      console.error("Save report error:", error);

      alert(
        error.response?.data?.message ||
          "Unable to save report. Please check the server connection."
      );
    } finally {
      setLoading(false);
    }
  };



  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "-";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    });
  };

  

  const handleView = async (id) => {
    try {
      const response = await api.get(`/admin/${id}`);

      if (response.data.success) {
        const selectedReport = response.data.data;

        navigate("/report", {
          state: {
            report: selectedReport,
          },
        });
      } else {
        alert("Unable to load the selected report.");
      }
    } catch (error) {
      console.error("View report error:", error);

      alert(
        error.response?.data?.message ||
          "Unable to open the report."
      );
    }
  };

  

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this report?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await api.delete(`/admin/${id}`);

      if (response.data.success) {
        setHistory((previousHistory) =>
          previousHistory.filter((item) => item._id !== id)
        );

        alert("Report deleted successfully.");
      } else {
        alert(response.data.message || "Unable to delete report.");
      }
    } catch (error) {
      console.error("Delete report error:", error);

      alert(
        error.response?.data?.message ||
          "Unable to delete the report."
      );
    }
  };

  

  return (
    <div className="admin-page">
      {/* Header */}
      <header className="admin-header">
        <h1>Club Management</h1>

        <div className="admin-actions">
          <Link to="/report" className="admin-report-link">
            View Report
          </Link>

          <button
            type="button"
            className="admin-logout-btn"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </header>

      <div className="admin-content">
        
        <form className="admin-form" onSubmit={handleSubmit}>
          <h2>Create Club Report</h2>


          <div className="form-group">
            <label htmlFor="clubName">Club Name</label>

            <input
              type="text"
              id="clubName"
              value={clubName}
              onChange={(e) => setClubName(e.target.value)}
              placeholder="Enter club name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="eventId">Event ID</label>

            <input
              type="text"
              id="eventId"
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
              placeholder="Enter event ID"
              required
            />
          </div>


          <div className="form-group">
            <label htmlFor="eventDate">Event Start Date</label>

            <input
              type="date"
              id="eventDate"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="eventEndDate">Event End Date</label>

            <input
              type="date"
              id="eventEndDate"
              value={eventEndDate}
              onChange={(e) => setEventEndDate(e.target.value)}
              min={eventDate || undefined}
              required
            />
          </div>

          <hr />


          <h3>Sales Details</h3>

          <div className="form-group">
            <label htmlFor="topUps">Top Ups</label>

            <input
              type="number"
              id="topUps"
              min="0"
              step="0.01"
              value={topUps}
              onChange={(e) => setTopUps(e.target.value)}
              placeholder="Enter top ups"
            />
          </div>

          <div className="form-group">
            <label htmlFor="sales">Sales</label>

            <input
              type="number"
              id="sales"
              min="0"
              step="0.01"
              value={sales}
              onChange={(e) => setSales(e.target.value)}
              placeholder="Enter sales"
            />
          </div>

          <div className="form-group">
            <label htmlFor="devices">Devices</label>

            <input
              type="number"
              id="devices"
              min="0"
              step="1"
              value={devices}
              onChange={(e) => setDevices(e.target.value)}
              placeholder="Enter number of devices"
            />
          </div>

          <div className="form-group">
            <label htmlFor="days">Days</label>

            <input
              type="number"
              id="days"
              min="1"
              step="1"
              value={days}
              onChange={(e) => setDays(e.target.value)}
              placeholder="Enter number of days"
            />
          </div>

          <hr />

          
          <h3>Payment Details</h3>

          <div className="form-group">
            <label htmlFor="card">Card</label>

            <input
              type="number"
              id="card"
              min="0"
              step="0.01"
              value={card}
              onChange={(e) => setCard(e.target.value)}
              placeholder="Enter card amount"
            />
          </div>

          <div className="form-group">
            <label htmlFor="cash">Cash</label>

            <input
              type="number"
              id="cash"
              min="0"
              step="0.01"
              value={cash}
              onChange={(e) => setCash(e.target.value)}
              placeholder="Enter cash amount"
            />
          </div>

          <div className="form-group">
            <label htmlFor="upi">UPI</label>

            <input
              type="number"
              id="upi"
              min="0"
              step="0.01"
              value={upi}
              onChange={(e) => setUpi(e.target.value)}
              placeholder="Enter UPI amount"
            />
          </div>

          <hr />


          <h3>Activation &amp; Manpower Details</h3>

          <div className="form-group">
            <label htmlFor="activations">
              Activations (Quantity)
            </label>

            <input
              type="number"
              id="activations"
              min="0"
              step="1"
              value={activations}
              onChange={(e) => setActivations(e.target.value)}
              placeholder="Enter number of activations"
              required
            />

            <small>
              Fixed rate: ₹{ACTIVATION_RATE} per activation
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="manPower">Manpower (Quantity)</label>

            <input
              type="number"
              id="manPower"
              min="0"
              step="1"
              value={manPower}
              onChange={(e) => setManPower(e.target.value)}
              placeholder="Enter manpower quantity"
              required
            />

            <small>
              Fixed rate: ₹
              {MANPOWER_RATE.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{" "}
              per manpower unit
            </small>
          </div>


          <button
            type="submit"
            className="admin-save-btn"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Report"}
          </button>
        </form>


        <section className="history-section">
          <div className="history-heading">
            <h2>Report History</h2>

            <button
              type="button"
              onClick={fetchHistory}
              disabled={historyLoading}
            >
              {historyLoading ? "Loading..." : "Refresh"}
            </button>
          </div>

          {historyLoading ? (
            <p>Loading report history...</p>
          ) : history.length === 0 ? (
            <p>No reports found.</p>
          ) : (
            <div className="history-table-wrapper">
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Club Name</th>
                    <th>Event ID</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>View</th>
                    <th>Delete</th>
                  </tr>
                </thead>

                <tbody>
                  {history.map((item) => (
                    <tr key={item._id}>
                      <td>{item.clubName || "-"}</td>
                      <td>{item.eventId || "-"}</td>
                      <td>{formatDate(item.eventDate)}</td>
                      <td>{formatDate(item.eventEndDate)}</td>

                      <td>
                        <button
                          type="button"
                          className="history-view-btn"
                          onClick={() => handleView(item._id)}
                        >
                          View
                        </button>
                      </td>

                      <td>
                        <button
                          type="button"
                          className="history-delete-btn"
                          onClick={() => handleDelete(item._id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
