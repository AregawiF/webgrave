import { useState, useRef } from "react";
import { QrReader } from "react-qr-reader";

export default function ScanCode() {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const qrReaderRef = useRef<any>(null); // Reference to the QrReader component

  const handleScanResult = (result: any, error: any) => {
    if (result) {
      const scannedUrl = result.getText();
      setScanResult(scannedUrl);
      
      // Stop the camera after scanning
      if (qrReaderRef.current) {
        qrReaderRef.current.stop();
      }
      
      // Redirect to the scanned URL
      window.location.href = scannedUrl;
    }

    if (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 mt-20">
      <div className="text-center max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Scan QR Code</h2>

        <QrReader
          ref={qrReaderRef}
          onResult={handleScanResult}
          constraints={{ facingMode: "environment" }} // Uses back camera
          containerStyle={{ width: "100%" }}
        />

        {scanResult ? (
          <p className="text-green-600 mt-4">Scanned: {scanResult}</p>
        ) : (
          <p className="text-gray-600 mt-4">Point your camera at a QR code</p>
        )}
      </div>
    </div>
  );
}
