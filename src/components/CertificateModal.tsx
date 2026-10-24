import React, { useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface CertificateModalProps {
  subjectTitle: string;
  studentName: string;
  onClose: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  subjectTitle,
  studentName,
  onClose,
}) => {
  const certificateRef = useRef<HTMLDivElement>(null);

  const handleDownloadPdf = async () => {
    if (!certificateRef.current) return;

    try {
      // 1. Tangkap area sertifikat menjadi canvas gambar
      const canvas = await html2canvas(certificateRef.current, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");

      // 2. Buat dokumen PDF format Landscape (A4)
      const pdf = new jsPDF("landscape", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      // 3. Masukkan gambar ke PDF lalu download otomatis
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Sertifikat-${subjectTitle}-${studentName}.pdf`);
    } catch (error) {
      console.error("Gagal mendownload sertifikat:", error);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.6)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
        padding: "20px",
      }}
    >
      <div
        className="card"
        style={{
          background: "#fff",
          maxWidth: "650px",
          width: "100%",
          textAlign: "center",
          padding: "40px",
          position: "relative",
          border: "8px solid #4f46e5",
          borderRadius: "12px",
        }}
      >
        {/* Tombol Tutup */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "12px",
            right: "12px",
            background: "none",
            border: "none",
            fontSize: "20px",
            cursor: "pointer",
          }}
        >
          ✖
        </button>

        {/* Tampilan Sertifikat yang diberi ref agar bisa di-capture */}
        <div ref={certificateRef} style={{ padding: "20px", background: "#ffffff" }}>
          <div style={{ fontSize: "36px", marginBottom: "8px" }}>🎓</div>
          <h2 style={{ letterSpacing: "2px", color: "#1e1b4b", textTransform: "uppercase" }}>
            Sertifikat Kelulusan
          </h2>
          <p style={{ color: "var(--text-muted)", marginTop: "8px" }}>
            Diberikan secara resmi kepada:
          </p>

          <h1 style={{ fontSize: "28px", color: "#4f46e5", margin: "16px 0", borderBottom: "2px solid #e2e8f0", paddingBottom: "8px" }}>
            {studentName}
          </h1>

          <p style={{ fontSize: "15px", lineHeight: "1.6" }}>
            Atas keberhasilan menyelesaikan seluruh modul & kuis dalam kursus:
            <br />
            <strong>{subjectTitle}</strong>
          </p>

          <div style={{ marginTop: "32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ textAlign: "left", fontSize: "12px", color: "var(--text-muted)" }}>
              <div>Tanggal: {new Date().toLocaleDateString("id-ID")}</div>
              <div>Status: Verified Student</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ borderBottom: "1px solid #000", width: "120px", marginBottom: "4px" }}></div>
              <small>E-Learning Director</small>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div style={{ marginTop: "24px", display: "flex", gap: "12px", justifyContent: "center" }}>
          <button className="btn-primary" onClick={handleDownloadPdf} style={{ cursor: "pointer", padding: "10px 20px" }}>
            📥 Download / Cetak PDF
          </button>
        </div>
      </div>
    </div>
  );
};