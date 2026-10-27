import { Link, useLocation, useNavigate } from "react-router-dom";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

import "./Report.css";


const ACTIVATION_RATE = 84.746;
const MANPOWER_RATE = 1186.45;

export default function Report({ onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();

  const report = location.state?.report;

  
  const formatMoney = (value) => {
    if (value === undefined || value === null || value === "") {
      return "-";
    }

    const amount = Number(value);

    if (!Number.isFinite(amount)) {
      return "-";
    }

    return amount.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  
  const formatDate = (value) => {
    if (!value) return "-";

    const dateString = String(value);

    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      const [year, month, day] = dateString.split("-");

      const monthName = new Date(
        `${dateString}T00:00:00`
      ).toLocaleDateString("en-IN", {
        month: "short",
      });

      return `${day} ${monthName} ${year}`;
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return dateString;
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  
  const eventStart =
    report?.eventDate ||
    report?.fromDate ||
    report?.startDate ||
    report?.dateFrom;

  const eventEnd =
    report?.eventEndDate ||
    report?.toDate ||
    report?.endDate ||
    report?.dateTo;

  const dateRange =
    eventStart && eventEnd
      ? `${formatDate(eventStart)} to ${formatDate(eventEnd)}`
      : formatDate(eventStart || eventEnd);

  // Print report
  const handlePrint = () => {
    window.print();
  };

  
  const handleDownloadPDF = async () => {
    const reportElement = document.getElementById("report-content");

    if (!reportElement) {
      alert("Report content not found.");
      return;
    }

    let pdfClone;

    try {

      const downloadDateTime = new Date().toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });

      const clubName = String(report?.clubName || "Club-Report")
        .replace(/[<>:"/\\|?*\x00-\x1F]/g, "-")
        .trim();

      const eventDate = String(dateRange || "Report").replace(/\s+/g, "-");

      
      pdfClone = reportElement.cloneNode(true);

      pdfClone.removeAttribute("id");

      pdfClone.style.width = "460px";
      pdfClone.style.maxWidth = "460px";
      pdfClone.style.margin = "0";
      pdfClone.style.padding = "20px 18px 16px";
      pdfClone.style.position = "fixed";
      pdfClone.style.left = "-10000px";
      pdfClone.style.top = "0";
      pdfClone.style.background = "#ffffff";
      pdfClone.style.boxSizing = "border-box";
      pdfClone.style.height = "auto";
      pdfClone.style.overflow = "visible";

      
      const downloadInfo = document.createElement("div");

      downloadInfo.className = "pdf-download-info";
      downloadInfo.textContent = `Downloaded on: ${downloadDateTime}`;

      downloadInfo.style.display = "block";
      downloadInfo.style.width = "100%";
      downloadInfo.style.marginTop = "8px";
      downloadInfo.style.paddingTop = "6px";
      downloadInfo.style.textAlign = "center";
      downloadInfo.style.fontSize = "9px";
      downloadInfo.style.lineHeight = "1.5";
      downloadInfo.style.color = "#555";
      downloadInfo.style.background = "#ffffff";
      downloadInfo.style.boxSizing = "border-box";

      pdfClone.appendChild(downloadInfo);

      document.body.appendChild(pdfClone);

      
      const images = Array.from(pdfClone.querySelectorAll("img"));

      await Promise.all(
        images.map((img) => {
          if (img.complete && img.naturalWidth > 0) {
            return Promise.resolve();
          }

          return new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve;
          });
        })
      );

      
      const canvas = await html2canvas(pdfClone, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        scrollX: 0,
        scrollY: 0,
        windowWidth: 520,
      });

      const imageData = canvas.toDataURL("image/jpeg", 0.98);

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true,
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const margin = 7;
      const availableWidth = pageWidth - margin * 2;
      const availableHeight = pageHeight - margin * 2;

      
      const scale = Math.min(
        availableWidth / canvas.width,
        availableHeight / canvas.height
      );

      const imageWidth = canvas.width * scale;
      const imageHeight = canvas.height * scale;

      const x = (pageWidth - imageWidth) / 2;
      const y = (pageHeight - imageHeight) / 2;

      pdf.addImage(
        imageData,
        "JPEG",
        x,
        y,
        imageWidth,
        imageHeight,
        undefined,
        "FAST"
      );

      // Download PDF
      pdf.save(`${clubName}-${eventDate}.pdf`);
    } catch (error) {
      console.error("PDF download failed:", error);
      alert("Unable to download the PDF. Please try again.");
    } finally {
      if (pdfClone?.parentNode) {
        pdfClone.parentNode.removeChild(pdfClone);
      }
    }
  };

  
  if (!report) {
    return (
      <div className="report-page">
        <header className="report-header no-print">
          <h2>Club Management</h2>

          <Link to="/admin" className="report-back-link">
            Back to Admin
          </Link>
        </header>

        <main className="report-empty">
          <h2>No Report Selected</h2>

          <p>Please open a report from the Admin Panel.</p>

          <button
            type="button"
            onClick={() => navigate("/admin")}
          >
            Go to Admin Panel
          </button>
        </main>
      </div>
    );
  }

  
  const activations = Number(
    report.activations ?? report.activationQuantity ?? 0
  );

  const manPower = Number(
    report.manPower ?? report.manpower ?? report.manPowerQuantity ?? 0
  );

  // Fixed rates
  const activationRate = Number(
    report.activationRate ?? ACTIVATION_RATE
  );

  const manpowerRate = Number(
    report.manpowerRate ?? MANPOWER_RATE
  );

  
  const activationAmount =
    report.activationAmount !== undefined &&
    report.activationAmount !== null
      ? Number(report.activationAmount)
      : Number((activations * activationRate).toFixed(2));

  const manpowerAmount =
    report.manpowerAmount !== undefined &&
    report.manpowerAmount !== null
      ? Number(report.manpowerAmount)
      : Number((manPower * manpowerRate).toFixed(2));

  // Summary section
  const summaryItems = [
    {
      label: "TOPUPS",
      value: report.topups ?? report.topUps,
    },
    {
      label: "SALES",
      value: report.sales,
    },
    {
      label: "DEVICES",
      value: report.devices,
      money: false,
    },
    {
      label: "DAYS",
      value: report.days,
      money: false,
    },
    {
      label: "BREAKAGE",
      value: report.breakage,
      description:
        report.breakageDescription || "Topups - Sales - Activations",
    },
  ];


  const paymentsTotal =
    report.paymentsTotal ?? report.subTotalPayments;

  const paymentItems = [
    {
      label: "CARD",
      value: report.card,
    },
    {
      label: "CASH (HANDOVER)",
      value: report.cash,
    },
    {
      label: "UPI",
      value: report.upi,
    },
    {
      label: "SUB TOTAL",
      value: paymentsTotal,
      total: true,
    },
    {
      label: "TOTAL",
      value: paymentsTotal,
      total: true,
    },
  ];

  // Invoice section
  const invoiceItems = [
    {
      label: "LICENCE FEE",
      value: report.licenceFee,
      description:
        report.licenceFeeDescription || "1.1% of Total Topup",
    },
    {
      label: "ACTIVATIONS",
      value: activationAmount,
      description: `${activations} activations × ₹${activationRate.toLocaleString(
        "en-IN",
        {
          minimumFractionDigits: 3,
          maximumFractionDigits: 3,
        }
      )}`,
    },
    {
      label: "MANPOWER",
      value: manpowerAmount,
      description: `${manPower} manpower × ₹${manpowerRate.toLocaleString(
        "en-IN",
        {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }
      )}`,
    },
    {
      label: "SUB TOTAL",
      value: report.subTotal,
      total: true,
    },
    {
      label: "GST",
      value: report.gst,
      description: "18%",
    },
    {
      label: "TOTAL",
      value: report.invoiceTotal,
      total: true,
    },
  ];

  
  const renderAmount = (item) => {
    if (
      item.value === undefined ||
      item.value === null ||
      item.value === ""
    ) {
      return "-";
    }

    return item.money === false
      ? item.value
      : formatMoney(item.value);
  };

  return (
    <div className="report-page">
      
      <header className="report-header no-print">
        <h2>Club Management</h2>

        <nav className="report-actions">
          <Link to="/admin">Admin Panel</Link>

          <button type="button" onClick={handlePrint}>
            Print Report
          </button>

          <button type="button" onClick={handleDownloadPDF}>
            Download PDF
          </button>

          {onLogout && (
            <button type="button" onClick={onLogout}>
              Logout
            </button>
          )}
        </nav>
      </header>


      <main id="report-content" className="payslip">

        <div className="payslip-brand">
          <div className="combined-logo">
            <div className="paynthra-name">PayNthra</div>

          
          </div>
        </div>

        <h1 className="payslip-heading">PAYSLIP</h1>

        <div className="payslip-club">
          {report.clubName || "Club Report"}
        </div>

        <div className="payslip-date">{dateRange}</div>

        <table className="payslip-table">
          <thead>
            <tr className="table-heading">
              <th>SUMMARY</th>
              <th>AMOUNT</th>
            </tr>
          </thead>

          <tbody>
            
            {summaryItems.map((item) => (
              <tr key={item.label}>
                <td>
                  <div className="report-label">{item.label}</div>

                  {item.description && (
                    <div className="report-description">
                      {item.description}
                    </div>
                  )}
                </td>

                <td className="report-amount">
                  {renderAmount(item)}
                </td>
              </tr>
            ))}


            <tr className="section-heading">
              <th colSpan="2">AMOUNT WITH payNthra</th>
            </tr>

            {paymentItems.map((item) => (
              <tr
                key={item.label}
                className={item.total ? "bold-row" : ""}
              >
                <td>{item.label}</td>

                <td className="report-amount">
                  {renderAmount(item)}
                </td>
              </tr>
            ))}


            <tr className="section-heading">
              <th colSpan="2">INVOICE</th>
            </tr>

            {invoiceItems.map((item) => (
              <tr
                key={item.label}
                className={item.total ? "bold-row" : ""}
              >
                <td>
                  <div className="report-label">{item.label}</div>

                  {item.description && (
                    <div className="report-description">
                      {item.description}
                    </div>
                  )}
                </td>

                <td className="report-amount">
                  {renderAmount(item)}
                </td>
              </tr>
            ))}


            <tr className="payable-row">
              <td>PAYABLE</td>

              <td className="report-amount">
                {renderAmount({
                  value: report.payable,
                })}
              </td>
            </tr>
          </tbody>
        </table>


        <footer className="payslip-footer">
          <div className="payslip-confidential">
            SYSTEM-GENERATED: CONFIDENTIAL. FOR INTENDED RECIPIENT
            <br />
            ONLY. DO NOT SHARE WITHOUT WRITTEN CONSENT.
          </div>

          <div className="payslip-reference">
            Ref:{" "}
            {report.refNo ||
              report._id ||
              report.id ||
              report.eventId ||
              "-"}
          </div>
        </footer>
      </main>

      
      <div className="report-bottom-actions no-print">
        <Link to="/admin" className="report-back-link">
          Back to Report History
        </Link>
      </div>
    </div>
  );
}